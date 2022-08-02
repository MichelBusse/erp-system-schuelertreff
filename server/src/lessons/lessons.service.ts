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

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonsRepository: Repository<Lesson>,

    private readonly contractsService: ContractsService,
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
      .leftJoin('l.contract', 'c')
      .select(['l'])
      .where('c.id = :contractId', { contractId: contractId })
      .andWhere('l.date::date = :lessonDate::date', { lessonDate: date })
    if (teacherId)
      lessonQuery.andWhere('c.teacherId = :teacherId', { teacherId: teacherId })

    const lesson = await lessonQuery.getOne()
    const contract = await this.contractsService.findOne(contractId, teacherId)
    return { contract: contract, lesson: lesson }
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

  async findInvoiceReadyByMonth({invoiceMonth, customerId, schoolId, teacherId} : {invoiceMonth: Dayjs, customerId?: number, schoolId?: number, teacherId?: number}) {
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
        invoiceMonthHigher: dayjs(invoiceMonth).add(1,'month').format(),
      })
      .andWhere('l.state = :lessonState', {
        lessonState: LessonState.HELD
      })

      if(customerId)
        q.andWhere('customer.id = :customerId', { customerId: customerId })

      if(schoolId)
        q.andWhere('school.id = :schoolId', { schoolId: schoolId })

      if(teacherId)
        q.andWhere('teacher.id = :teacherId', { teacherId: teacherId })

    return q.getMany()
  }


  async generatePDF(): Promise<Buffer> {
    const passengers = [
      {
        name: 'Joyce',
        flightNumber: 7859,
        time: '18:00',
      },
      {
        name: 'Brock',
        flightNumber: 7859,
        time: '18:00',
      },
      {
        name: 'Eve',
        flightNumber: 7859,
        time: '18:00',
      },
    ]

    const filePath = path.join(__dirname, 'templates/test.ejs')

    const content = await ejs.renderFile(filePath, { passengers })

    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setContent(content)

    const buffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        left: '20px',
        top: '20px',
        right: '20px',
        bottom: '20px',
      },
    })

    await browser.close()

    return buffer
  }
}