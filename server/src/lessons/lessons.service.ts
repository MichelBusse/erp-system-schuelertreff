import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import dayjs, { Dayjs } from 'dayjs'
import { Repository } from 'typeorm'

import { ContractState } from 'src/contracts/contract.entity'
import { ContractsService } from 'src/contracts/contracts.service'

import { CreateLessonDto } from './dto/create-lesson.dto'
import { Lesson, LessonState } from './lesson.entity'

import ejs from 'ejs'
import path from 'path'
import * as puppeteer from 'puppeteer'
import { UsersService } from 'src/users/users.service'
import { Role } from 'src/auth/role.enum'

require('dayjs/locale/de')

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonsRepository: Repository<Lesson>,

    private readonly contractsService: ContractsService,

    private readonly usersService: UsersService,
  ) {}

  async create(
    createLessonDto: CreateLessonDto,
    teacherId?: number,
  ): Promise<Lesson> {
    const lesson = new Lesson()

    const contract = await this.contractsService.findOne(
      createLessonDto.contractId,
      teacherId,
    )

    if (contract) {
      if (contract.state !== ContractState.ACCEPTED)
        throw new BadRequestException(
          'You cannot create lessons of unaccepted contracts',
        )

      lesson.date = createLessonDto.date
      lesson.state = createLessonDto.state
      lesson.notes = createLessonDto.notes
      lesson.contract = contract

      return this.lessonsRepository.save(lesson)
    } else {
      throw new BadRequestException(
        'You do not have permission to create this lesson',
      )
    }
  }

  async update(
    id: number,
    createLessonDto: CreateLessonDto,
    teacherId?: number,
  ): Promise<Lesson> {
    const lesson = await this.lessonsRepository.findOne(id, {
      relations: ['contract', 'contract.teacher'],
    })

    if (
      lesson.contract.state === ContractState.ACCEPTED &&
      (!teacherId || (teacherId && lesson.contract.teacher.id === teacherId))
    ) {
      lesson.state = createLessonDto.state
      lesson.notes = createLessonDto.notes
 
      return this.lessonsRepository.save(lesson)
    } else {
      throw new BadRequestException(
        'You do not have permission to create this lesson',
      )
    }
  }

  async findAll(): Promise<Lesson[]> {
    return this.lessonsRepository.find({
      loadRelationIds: true,
    })
  }

  async findOne(contractId: string, date: string, teacherId?: number) {
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
    return lesson
  }

  async remove(id: string): Promise<void> {
    await this.lessonsRepository.delete(id)
  }

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
    const pendingContracts = await this.contractsService.findAllPending(
      teacherId,
    )

    return {
      lessons: lessonsOfWeek,
      contracts: contractsOfWeek,
      pendingContracts: pendingContracts,
    }
  }

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

    q.orderBy('l.date');

    return q.getMany()
  }

  async generateInvoiceTeacher({
    invoiceMonth,
    teacherId,
  }: {
    invoiceMonth: Dayjs
    teacherId: number
  }): Promise<Buffer> {

    const teacher = await this.usersService.findOneTeacher(teacherId)

    const lessons = await this.findInvoiceReadyByMonth({invoiceMonth, teacherId})

    if (!teacher) throw new BadRequestException('The customer does not exist')


    const rows = []

    lessons.forEach((lesson) => {
      rows.push({
        subject: lesson.contract.subject.name,
        duration: (dayjs(lesson.contract.endTime, 'HH:mm').diff(dayjs(lesson.contract.startTime, 'HH:mm'), 'minute') / 60).toFixed(2).replace('.', ','),
        date: dayjs(lesson.date).format('DD.MM.YYYY'),
        notes: lesson.notes
      })
    })

    const invoiceInfo = {
      date: dayjs().format('DD.MM.YYYY'),
      month: invoiceMonth.locale('de').format('MMMM YYYY'),
    }

    const filePath = path.join(__dirname, '../templates/teacherList.ejs')

    const content = await ejs.renderFile(filePath, {
      rows,
      teacher,
      invoiceInfo,
    })

    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setContent(content)

    const buffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        left: '40px',
        top: '40px',
        right: '40px',
        bottom: '40px',
      },
    })

    await browser.close()

    return buffer
  }

  async generateInvoice({
    invoiceMonth,
    customerId,
    schoolId,
  }: {
    invoiceMonth: Dayjs
    customerId?: number
    schoolId?: number
  }): Promise<Buffer> {

    let customer = null

    if (customerId) {
      customer = await this.usersService.findOneCustomer(customerId)
    } else if (schoolId) {
      customer = await this.usersService.findOneSchool(customerId)
    }

    const lessons = await this.findInvoiceReadyByMonth({invoiceMonth, customerId, schoolId})

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

    for (let lesson of lessons) {
      const name = lesson.contract.subject.name
      const duration = dayjs(lesson.contract.endTime, 'HH:mm').diff(dayjs(lesson.contract.startTime, 'HH:mm'), 'minute') / 60
      subjectCounts.set(
        name,
        subjectCounts.get(name) ? subjectCounts.get(name) + duration : duration
      )
    }

    const rows = []
    let totalPrice = 0

    subjectCounts.forEach((count, subject) => {
      rows.push({
        subject,
        unitPrice: Number(customer.fee).toFixed(2).replace(".", ","),
        count: count.toFixed(2).replace(".", ","),
        totalPrice: Number(customer.fee * count).toFixed(2).replace(".", ","),
      })
      totalPrice += Number(customer.fee * count)
    })

    const invoiceInfo = {
      date: dayjs().format('DD.MM.YYYY'),
      month: invoiceMonth.locale('de').format('MMMM / YYYY'),
      number: 1,
      type: 'Nachhilfe',
      totalPrice: totalPrice.toFixed(2).replace(".", ","),
    }

    const filePath = path.join(__dirname, '../templates/customerInvoice.ejs')

    const content = await ejs.renderFile(filePath, {
      rows,
      address,
      invoiceInfo,
    })

    const browser = await puppeteer.launch({ headless: true })
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

    return buffer
  }
}
