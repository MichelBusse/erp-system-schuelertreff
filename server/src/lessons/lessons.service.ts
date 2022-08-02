import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import dayjs, { Dayjs } from 'dayjs'
import { DataSource, DeepPartial, Repository } from 'typeorm'

import { Contract, ContractState } from 'src/contracts/contract.entity'
import { ContractsService } from 'src/contracts/contracts.service'
import { getNextDow, maxDate, minDate } from 'src/date'
import { Leave, LeaveState } from 'src/users/entities/leave.entity'

import { CreateLessonDto } from './dto/create-lesson.dto'
import { Lesson, LessonState } from './lesson.entity'

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonsRepository: Repository<Lesson>,

    private readonly contractsService: ContractsService,

    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateLessonDto, teacherId?: number): Promise<Lesson> {
    const lesson = new Lesson()

    const contract = await this.contractsService.findOne(
      dto.contractId,
      teacherId,
    )

    // check for intersecting leaves
    if ((await this.checkLeave(dto.date, contract.teacher.id)) > 0)
      throw new BadRequestException('Lesson is blocked')

    if (contract) {
      if (contract.state !== ContractState.ACCEPTED)
        throw new BadRequestException(
          'You cannot create lessons of unaccepted contracts',
        )

      lesson.date = dto.date
      lesson.state = dto.state
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
    dto: CreateLessonDto,
    teacherId?: number,
  ): Promise<Lesson> {
    const lesson = await this.lessonsRepository.findOne({
      where: { id },
      relations: ['contract', 'contract.teacher'],
    })

    // check for intersecting leaves
    if ((await this.checkLeave(dto.date, lesson.contract.teacher.id)) > 0)
      throw new BadRequestException('Lesson is blocked')

    if (
      lesson.contract.state === ContractState.ACCEPTED &&
      (!teacherId || (teacherId && lesson.contract.teacher.id === teacherId))
    ) {
      lesson.state = dto.state

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

  async findOne(contractId: number, date: string, teacherId?: number) {
    const lessonQuery = this.lessonsRepository
      .createQueryBuilder('l')
      .leftJoin('l.contract', 'c')
      .where('c.id = :contractId', { contractId: contractId })
      .andWhere('l.date::date = :lessonDate::date', { lessonDate: date })
    if (teacherId)
      lessonQuery.andWhere('c.teacherId = :teacherId', { teacherId: teacherId })

    const lesson = await lessonQuery.getOne()
    const contract = await this.contractsService.findOne(contractId, teacherId)
    const blocked = (await this.checkLeave(date, contract.teacher.id)) > 0
    return { contract, lesson, blocked }
  }

  async remove(id: number): Promise<void> {
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
    const pendingContracts =
      await this.contractsService.findAllPendingForTeacher(teacherId)

    return {
      lessons: lessonsOfWeek,
      contracts: contractsOfWeek,
      pendingContracts: pendingContracts,
    }
  }

  getLessonDates(
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
      const dates = this.getLessonDates(
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
      .where(`l."userId" = :userId`, { userId: contract.teacher.id })
      .andWhere(`l.state = :state`, { state: LeaveState.ACCEPTED })
      .andWhere(`l."startDate" <= :end::date`, { end: contract.endDate })
      .andWhere(`l."endDate" >= :start::date`, { start: contract.startDate })

    const leaves: Leave[] = await qb.getMany()

    const contractLessons = await this.lessonsRepository
      .createQueryBuilder('l')
      .where(`l.contractId = :contractId`, { contractId: contract.id })
      .getMany()

    const lessons: DeepPartial<Lesson>[] = leaves.flatMap((l) => {
      const dates = this.getLessonDates(
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
}
