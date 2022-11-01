import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import dayjs, { Dayjs } from 'dayjs'
import ejs from 'ejs'
import path from 'path'
import * as puppeteer from 'puppeteer'
import { DataSource, DeepPartial, Repository } from 'typeorm'

import { Role } from 'src/auth/role.enum'
import {
  Contract,
  ContractState,
  ContractType,
} from 'src/contracts/contract.entity'
import { ContractsService } from 'src/contracts/contracts.service'
import { getNextDow, maxDate, minDate } from 'src/date'
import { ClassCustomer } from 'src/users/entities'
import { Leave, LeaveState } from 'src/users/entities/leave.entity'
import { UsersService } from 'src/users/users.service'

import { CreateLessonDto } from './dto/create-lesson.dto'
import { Invoice } from './invoice.entity'
import { Lesson, LessonState } from './lesson.entity'

require('dayjs/locale/de')

export function getLessonDates(
  contract: Contract,
  startDate: Dayjs,
  endDate: Dayjs,
): Dayjs[] {
  const dow = dayjs(contract.startDate).day()
  const start = maxDate(dayjs(contract.startDate), startDate)
  const end = minDate(dayjs(contract.endDate), endDate)

  const dates: Dayjs[] = []

  for (
    let i = getNextDow(dow, start);
    !i.isAfter(end);
    i = i.add(contract.interval, 'week')
  ) {
    dates.push(i)
  }

  return dates
}

function formatInvoiceNumber(year: number, number: number): string {
  return String(year) + 'ST-' + String(number).padStart(5, '0')
}

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonsRepository: Repository<Lesson>,

    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,

    private readonly contractsService: ContractsService,

    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  // Creates lesson if corresponding contract is accepted
  async create(dto: CreateLessonDto, teacherId?: number): Promise<Lesson> {
    const lesson = new Lesson()

    const contract = await this.contractsService.findOne(
      dto.contractId,
      teacherId,
    )

    // check for intersecting leaves
    if (
      contract.teacher
        ? (await this.checkLeave(dto.date, contract.teacher.id)) > 0
        : false
    )
      throw new BadRequestException('Lesson is blocked')

    if (contract) {
      if (contract.state !== ContractState.ACCEPTED)
        throw new BadRequestException(
          'You cannot create lessons of unaccepted contracts',
        )

      lesson.date = dto.date
      lesson.state = dto.state
      lesson.notes = dto.notes
      lesson.contract = contract

      return this.lessonsRepository.save(lesson)
    } else {
      throw new BadRequestException(
        'You do not have permission to create this lesson',
      )
    }
  }

  // Updated Lessons
  async update(
    id: number,
    dto: CreateLessonDto,
    teacherId?: number,
  ): Promise<Lesson> {
    const lesson = await this.lessonsRepository.findOne({
      where: { id },
      relations: ['contract', 'contract.teacher'],
    })
    // check for intersecting leaves
    if (
      lesson.contract.teacher &&
      (await this.checkLeave(dto.date, lesson.contract.teacher.id)) > 0
    )
      throw new BadRequestException('Lesson is blocked')

    if (
      lesson.contract.state === ContractState.ACCEPTED &&
      (!teacherId || (teacherId && lesson.contract.teacher.id === teacherId))
    ) {
      lesson.state = dto.state
      lesson.notes = dto.notes

      return this.lessonsRepository.save(lesson)
    } else {
      throw new BadRequestException(
        'You do not have permission to update this lesson',
      )
    }
  }

  async findAll(): Promise<Lesson[]> {
    return this.lessonsRepository.find({
      loadRelationIds: true,
    })
  }

  //
  async findOne(contractId: number, date: string, teacherId?: number) {
    const lessonQuery = this.lessonsRepository
      .createQueryBuilder('l')
      .select(['l', 'c', 'customer', 'school', 'subject'])
      .leftJoin('l.contract', 'c')
      .leftJoin('c.subject', 'subject')
      .leftJoin('c.customers', 'customer')
      .leftJoin('customer.school', 'school')
      .where('c.id = :contractId', { contractId: contractId })
      .andWhere('l.date::date = :lessonDate::date', { lessonDate: date })
    if (teacherId)
      lessonQuery.andWhere('c.teacherId = :teacherId', { teacherId: teacherId })

    const lesson = await lessonQuery.getOne()
    const contract = await this.contractsService.findOne(contractId, teacherId)
    let blocked = false
    if (contract.teacher)
      blocked = (await this.checkLeave(date, contract.teacher.id)) > 0

    return { contract, lesson, blocked }
  }

  async remove(id: number): Promise<void> {
    await this.lessonsRepository.delete(id)
  }

  /**
   *
   * @param week // Date of the required week
   * @param teacherId // Optional TeacherId if only results of one teacher should be send
   * @returns // Lessons of the specified week with boolean if it's blocked
   *          // Contracts of the specified week
   *          // All Contracts which have not been accepted or declined by the teacher yet
   */
  async findByWeek(week: Dayjs | Date, teacherId?: number) {
    const q = this.lessonsRepository
      .createQueryBuilder('l')
      .select(['l', 'c.id'])
      .leftJoin('l.contract', 'c')
      .where(`l.date >= date_trunc('week', :week::date)`, {
        week: dayjs(week).format(),
      })
      .andWhere(`l.date <= date_trunc('week', :week::date) + interval '4 day'`)

    if (typeof teacherId !== 'undefined')
      q.andWhere('c.teacherId = :teacherId', { teacherId: teacherId })

    const lessonsOfWeek = await q.getMany()
    const contractsOfWeek = await this.contractsService.findByWeek(
      dayjs(week),
      teacherId,
    )

    const pendingContracts =
      await this.contractsService.findAllPendingForTeacher(teacherId)

    const contractsWithBlockState = await Promise.all(
      contractsOfWeek.map(async (c) => {
        if (c.teacher)
          return {
            ...c,
            blocked:
              (await this.checkLeave(
                dayjs(week)
                  .startOf('week')
                  .add(dayjs(c.startDate).day(), 'day')
                  .format(),
                c.teacher.id,
              )) > 0,
          }
        return { ...c, blocked: false }
      }),
    )

    return {
      lessons: lessonsOfWeek,
      contracts: contractsWithBlockState,
      pendingContracts: pendingContracts,
    }
  }

  /**
   * Checks if the lessons of a given contract are before or after its livespan and if they are, deletes them
   *
   * @param contract // the contract of which the lessons have to be validated
   */
  async findAndValidateAllByContract(contract: Contract) {
    const lessonsOfContract = this.lessonsRepository.findBy({
      contract: { id: contract.id },
    })

    ;(await lessonsOfContract).forEach((l) => {
      //If lesson date is before the startDate of contract or after the endDate
      if (
        dayjs(l.date).isBefore(dayjs(contract.startDate)) ||
        dayjs(l.date).isAfter(dayjs(contract.endDate))
      ) {
        this.lessonsRepository.delete(l.id)
      }
    })
  }

  /**
   *
   * @param invoiceMonth // Date of the month of the required invoice
   * @param customerId // Optional: id of the privateCustomer of the invoice
   * @param schoolId // Optional: id of the school of the invoice
   * @param teacherId // Optional: id of the teacher of the invoice
   * @returns // all lessons which are relevant for the invoice generation (State: Held and in time range)
   */
  async findInvoiceReadyByMonth({
    invoiceMonth,
    customerId,
    schoolId,
    teacherId,
  }: {
    invoiceMonth: Dayjs
    customerId?: number
    schoolId?: number
    teacherId?: number
  }) {
    const q = this.lessonsRepository
      .createQueryBuilder('l')
      .select(['l', 'c', 'subject', 'school', 'customer', 'teacher'])
      .leftJoin('l.contract', 'c')
      .leftJoin('c.customers', 'customer')
      .leftJoin('c.subject', 'subject')
      .leftJoin('customer.school', 'school')
      .leftJoin('c.teacher', 'teacher')
      .where(`l.date >= date_trunc('month', :invoiceMonthLower::date)`, {
        invoiceMonthLower: dayjs(invoiceMonth).format(),
      })
      .andWhere(`l.date < date_trunc('month', :invoiceMonthHigher::date)`, {
        invoiceMonthHigher: dayjs(invoiceMonth).add(1, 'month').format(),
      })
      .andWhere('l.state = :lessonState', {
        lessonState: LessonState.HELD,
      })

    if (customerId)
      q.andWhere('customer.id = :customerId', { customerId: customerId })

    if (schoolId) q.andWhere('school.id = :schoolId', { schoolId: schoolId })

    if (teacherId)
      q.andWhere('teacher.id = :teacherId', { teacherId: teacherId })

    q.orderBy('l.date')

    return q.getMany()
  }

  // Generate invoice PDF of the specified teacher
  async generateInvoiceTeacher({
    invoiceMonth,
    teacherId,
    teacherInvoiceData,
  }: {
    invoiceMonth: Dayjs
    teacherId: number
    teacherInvoiceData: {
      kilometers: number
      costPerLiter: number
      consumption: number
    }
  }): Promise<Buffer> {
    const teacher = await this.usersService.findOneTeacher(teacherId)

    const lessons = await this.findInvoiceReadyByMonth({
      invoiceMonth,
      teacherId,
    })

    if (!teacher) throw new BadRequestException('The customer does not exist')

    const rows = []
    let totalHours = 0

    lessons.forEach((lesson) => {
      const duration =
        dayjs(lesson.contract.endTime, 'HH:mm').diff(
          dayjs(lesson.contract.startTime, 'HH:mm'),
          'minute',
        ) / 60
      rows.push({
        subject: lesson.contract.subject.name,
        duration: duration.toFixed(2).replace('.', ','),
        date: dayjs(lesson.date).format('DD.MM.YYYY'),
        notes: lesson.notes,
      })
      totalHours += duration
    })

    const invoiceInfo = {
      date: dayjs().format('DD.MM.YYYY'),
      month: invoiceMonth.locale('de').format('MMMM YYYY'),
      teacherInvoiceData: {
        kilometers: teacherInvoiceData.kilometers.toFixed(2).replace('.', ','),
        kilometersHalf: (teacherInvoiceData.kilometers / 2)
          .toFixed(2)
          .replace('.', ','),
        consumption: teacherInvoiceData.consumption
          .toFixed(2)
          .replace('.', ','),
        costPerLiter: teacherInvoiceData.costPerLiter
          .toFixed(2)
          .replace('.', ','),
        fee: Number(teacher.fee).toFixed(2).replace('.', ','),
        totalDrivingCosts: (
          teacherInvoiceData.consumption *
          teacherInvoiceData.costPerLiter *
          teacherInvoiceData.kilometers *
          0.005
        )
          .toFixed(2)
          .replace('.', ','),
        totalHours: totalHours.toFixed(2).replace('.', ','),
        totalHourCosts: (totalHours * teacher.fee).toFixed(2).replace('.', ','),
        totalCosts: (
          totalHours * teacher.fee +
          teacherInvoiceData.consumption *
            teacherInvoiceData.costPerLiter *
            teacherInvoiceData.kilometers *
            0.005
        )
          .toFixed(2)
          .replace('.', ','),
      },
    }

    const filePath = path.join(__dirname, '../templates/teacherList.ejs')

    const content = await ejs.renderFile(filePath, {
      rows,
      teacher,
      invoiceInfo,
    })

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium-browser',
      args: [
        '--no-sandbox',
        '--headless',
        '--disable-gpu',
        '--disable-dev-shm-usage',
      ],
    })
    const page = await browser.newPage()
    await page.setContent(content)

    const buffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `<header style="width: 100%; padding: 0 30px; font-size: 12px; font-family: Verdana, Geneva, Tahoma, sans-serif;">
        <h1 style="font-size: 25px;">Abrechnung Mitarbeiter</h1>
        <table class="headerData" style="width: 100%;">
          <tr>
            <td style="width: 50%;">
              <p>Name: ${teacher.firstName + ' ' + teacher.lastName}</p>
            </td>
            <td style="width: 50%;">
              <p>Monat / Jahr: ${invoiceInfo.month}</p>
            </td>
          </tr>
        </table>
      </header>`,
      footerTemplate: `<footer style="text-align: right; width: 100%; padding: 0 30px; font-size: 10px; font-family: Verdana, Geneva, Tahoma, sans-serif;"><span class="pageNumber"></span><span>/</span><span class="totalPages"></span></footer>`,
      margin: {
        left: '40px',
        top: '190px',
        right: '40px',
        bottom: '40px',
      },
    })

    await browser.close()

    return buffer
  }

  // Generate invoice PDF of the specified customer or school
  async generateInvoice({
    invoiceMonth,
    customerId,
    schoolId,
    invoiceData,
  }: {
    invoiceMonth: Dayjs
    customerId?: number
    schoolId?: number
    invoiceData: {
      invoiceNumber: number
      invoiceType: string
      invoicePreparationTime: number
      invoiceDate: string
    }
  }): Promise<Buffer> {
    let customer = null

    if (customerId) {
      customer = await this.usersService.findOneCustomer(customerId)
    } else if (schoolId) {
      customer = await this.usersService.findOneSchool(schoolId)
    }

    const lessons = await this.findInvoiceReadyByMonth({
      invoiceMonth,
      customerId,
      schoolId,
    })

    if (!customer) throw new BadRequestException('The customer does not exist')

    const address = {
      schoolName: '',
      firstName: customer.firstName,
      lastName: customer.lastName,
      street: customer.street,
      zip: customer.postalCode,
      city: customer.city,
    }

    if (customer.role === Role.SCHOOL) {
      address.schoolName = customer.schoolName
    }

    const subjectCounts = new Map()

    for (const lesson of lessons) {
      const customers = lesson.contract.customers

      let name = ''
      if (customers[0].role === Role.PRIVATECUSTOMER) {
        name =
          lesson.contract.subject.name +
          (lesson.contract.contractType === 'standard'
            ? ' (Präsenz)'
            : ' (Online)')
      } else if (customers[0].role === Role.CLASSCUSTOMER) {
        const schoolName = (customers[0] as ClassCustomer).school.schoolName
        const classNames = customers
          .map((c) => (c as ClassCustomer).className)
          .join(', ')

        name =
          schoolName +
          ' (' +
          classNames +
          ') ' +
          lesson.contract.subject.name +
          (lesson.contract.contractType === 'standard'
            ? ' (Präsenz)'
            : ' (Online)')
      }

      const duration =
        (dayjs(lesson.contract.endTime, 'HH:mm').diff(
          dayjs(lesson.contract.startTime, 'HH:mm'),
          'minute',
        ) /
          60) *
        ((45 + invoiceData.invoicePreparationTime) / 45)

      const type = lesson.contract.contractType

      subjectCounts.set(name, {
        count: subjectCounts.get(name)
          ? subjectCounts.get(name).count + duration
          : duration,
        type: type,
      })
    }

    const rows = []
    let totalPrice = 0

    subjectCounts.forEach(
      ({ count, type }: { count: number; type: ContractType }, subject) => {
        const fee =
          type === ContractType.STANDARD
            ? customer.feeStandard
            : customer.feeOnline

        rows.push({
          subject,
          unitPrice: Number(fee).toFixed(2).replace('.', ','),
          count: count.toFixed(2).replace('.', ','),
          totalPrice: Number(fee * count)
            .toFixed(2)
            .replace('.', ','),
        })
        totalPrice += Number(fee * count)
      },
    )

    const invoiceInfo = {
      date: dayjs(invoiceData.invoiceDate, 'YYYY-MM-DD').format('DD.MM.YYYY'),
      month: invoiceMonth.locale('de').format('MMMM / YYYY'),
      number: formatInvoiceNumber(
        dayjs(invoiceData.invoiceDate, 'YYYY-MM-DD').year(),
        invoiceData.invoiceNumber,
      ),
      type: invoiceData.invoiceType,
      totalPrice: totalPrice.toFixed(2).replace('.', ','),
    }

    const filePath = path.join(__dirname, '../templates/customerInvoice.ejs')

    const content = await ejs.renderFile(filePath, {
      rows,
      address,
      invoiceInfo,
    })

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium-browser',
      args: [
        '--no-sandbox',
        '--headless',
        '--disable-gpu',
        '--disable-dev-shm-usage',
      ],
    })
    const page = await browser.newPage()
    await page.setContent(content)

    const buffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        left: '0px',
        top: '0px',
        right: '0px',
        bottom: '0px',
      },
    })

    await browser.close()

    this.invoiceRepository.insert({ number: invoiceData.invoiceNumber })

    return buffer
  }

  async getLatestInvoiceNumber(): Promise<number> {
    const latestInvoices = await this.invoiceRepository
      .createQueryBuilder('i')
      .select('i.number')
      .where(
        `date_trunc('year', i.generationTime) = date_trunc('year', CURRENT_TIMESTAMP)`,
      )
      .orderBy('i.number', 'DESC')
      .getMany()

    if (latestInvoices.length > 0) {
      return latestInvoices[0].number
    } else {
      return 1
    }
  }

  async cancelByLeave(leave: Leave) {
    const qb = this.dataSource.createQueryBuilder()

    qb.select('c')
      .from(Contract, 'c')
      .where(`c."teacherId" = :userId`, { userId: leave.user.id })
      .andWhere(`c.state = :state`, { state: ContractState.ACCEPTED })
      .andWhere(`c."startDate" <= :end::date`, { end: leave.endDate })
      .andWhere(`c."endDate" >= :start::date`, { start: leave.startDate })
      .leftJoinAndSelect('c.lessons', 'lesson')

    const contracts: Contract[] = await qb.getMany()

    const lessons: DeepPartial<Lesson>[] = contracts.flatMap((c) => {
      const dates = getLessonDates(
        c,
        dayjs(leave.startDate),
        dayjs(leave.endDate),
      ).map((d) => d.format('YYYY-MM-DD'))

      return dates.map((d) => {
        const existingLesson = c.lessons.find((l) => l.date === d)

        if (typeof existingLesson === 'undefined') {
          // lesson does not exist yet
          return {
            contract: { id: c.id },
            date: d,
            state: LessonState.CANCELLED,
          }
        } else {
          // lesson already exists, set it to cancelled
          return {
            ...existingLesson,
            state: LessonState.CANCELLED,
          }
        }
      })
    })

    return this.lessonsRepository.save(lessons)
  }

  async cancelByContract(contract: Contract) {
    const qb = this.dataSource.createQueryBuilder()

    qb.select('l')
      .from(Leave, 'l')
      .where(`l.state = :state`, { state: LeaveState.ACCEPTED })
      .andWhere(`l."startDate" <= :end::date`, { end: contract.endDate })
      .andWhere(`l."endDate" >= :start::date`, { start: contract.startDate })

    if (contract.teacher)
      qb.andWhere(`l."userId" = :userId`, { userId: contract.teacher.id })

    const leaves: Leave[] = await qb.getMany()

    const contractLessons = await this.lessonsRepository
      .createQueryBuilder('l')
      .where(`l.contractId = :contractId`, { contractId: contract.id })
      .getMany()

    const lessons: DeepPartial<Lesson>[] = leaves.flatMap((l) => {
      const dates = getLessonDates(
        contract,
        dayjs(l.startDate),
        dayjs(l.endDate),
      )

      return dates.map((d) => {
        const dateString = d.format('YYYY-MM-DD')

        const existingLesson = contractLessons.find(
          (l) => l.date === dateString,
        )

        if (typeof existingLesson === 'undefined') {
          // lesson does not exist yet
          return {
            contract: { id: contract.id },
            date: dateString,
            state: LessonState.CANCELLED,
          }
        } else {
          // lesson already exists, set it to cancelled
          return {
            ...existingLesson,
            state: LessonState.CANCELLED,
          }
        }
      })
    })

    return this.lessonsRepository.save(lessons)
  }

  async checkLeave(date: string, userId: number) {
    const q = this.dataSource
      .createQueryBuilder()
      .select('l')
      .from(Leave, 'l')
      .where(`l."userId" = :userId`, { userId })
      .andWhere(`l."startDate" <= :lessonDate::date`, { lessonDate: date })
      .andWhere(`l."endDate" >= :lessonDate::date`)
      .andWhere(`l.state = :state`, { state: LeaveState.ACCEPTED })

    return q.getCount()
  }

  /**
   * check if a date is valid for a contract
   * returns true if valid
   */
  async validateDate(date: string, contractId: number): Promise<boolean> {
    return this.contractsService
      .findOne(contractId)
      .then(
        (c) =>
          c !== null &&
          !dayjs(date).isBefore(c.startDate) &&
          !dayjs(date).isAfter(c.endDate) &&
          (dayjs(c.startDate).diff(date, 'day') / 7) % c.interval === 0,
      )
  }
}
