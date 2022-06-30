import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import dayjs, { Dayjs } from 'dayjs'
import { Repository } from 'typeorm'

import { ContractsService } from 'src/contracts/contracts.service'

import { CreateLessonDto } from './dto/create-lesson.dto'
import { Lesson } from './lesson.entity'
import { ContractState } from 'src/contracts/contract.entity'

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
}
