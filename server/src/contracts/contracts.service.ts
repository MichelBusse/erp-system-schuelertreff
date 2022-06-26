import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectConnection, InjectRepository } from '@nestjs/typeorm'
import dayjs, { Dayjs } from 'dayjs'
import { Brackets, Connection, Repository } from 'typeorm'

import { timeAvailable } from 'src/users/dto/timeAvailable'
import { Customer, User } from 'src/users/entities'
import { parseMultirange, UsersService } from 'src/users/users.service'

import { Contract } from './contract.entity'
import { CreateContractDto } from './dto/create-contract.dto'
import { SuggestContractsDto } from './dto/suggest-contracts.dto'

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractsRepository: Repository<Contract>,

    @InjectConnection()
    private connection: Connection,

    private readonly usersService: UsersService,
  ) {}

  async create(dto: CreateContractDto): Promise<Contract> {
    const contract = this.contractsRepository.create({
      ...dto,
      subject: { id: dto.subject },
      teacher: await this.usersService
        .findOneTeacher(dto.teacher)
        .then((c) => ({ id: c.id })),
      customers: await Promise.all(
        dto.customers.map((id) =>
          this.usersService.findOneCustomer(id).then((c) => ({ id: c.id })),
        ),
      ),
    })

    return this.contractsRepository.save(contract)
  }

  async findAll(): Promise<Contract[]> {
    return this.contractsRepository.find({
      loadRelationIds: true,
    })
  }

  async findOne(id: string): Promise<Contract> {
    return this.contractsRepository.findOne(id, {
      relations: ['subject', 'teacher', 'customers'],
    })
  }

  async suggestContracts(dto: SuggestContractsDto): Promise<any[]> {
    const dowFilter =
      typeof dto.dow !== 'undefined' ? [dto.dow] : [1, 2, 3, 4, 5]

    const dowTime = dowFilter.map((dow) => {
      const start = `2001-01-0${dow} ${dto.startTime ?? '00:00'}`
      const end =
        typeof dto.endTime !== 'undefined'
          ? `2001-01-0${dow} ${dto.endTime}`
          : `2001-01-0${dow + 1} 00:00` // exclusive bound of next day 00:00

      return `[${start}, ${end})`
    })

    const dowTimeFilter = `{${dowTime.join(', ')}}`

    // begin actual query

    const qb = this.connection.createQueryBuilder()

    // subquery: when are all customers available?
    const cTimes = qb
      .subQuery()
      .select('intersection(c."timesAvailable") * :filter::tstzmultirange')
      .from(Customer, 'c')
      .where('c.id IN (:...cid)', { cid: dto.customers })
      .having('count(c) = :cc', { cc: dto.customers.length })
      .setParameter('filter', dowTimeFilter)

    const mainQuery = qb
      .select('*')
      .from((subq) => {
        return subq
          .select('t.id', 'teacherId')
          .addSelect('t.firstName', 'firstName')
          .addSelect('t.lastName', 'lastName')
          .addSelect('t.timesAvailable * ' + cTimes.getQuery(), 'possibleTimes')
          .from(User, 't')
          .leftJoin('t.subjects', 'subject')
          .where('t.type = :tt', { tt: 'Teacher' })
          .andWhere('subject.id = :subjectId', { subjectId: dto.subjectId })
          .setParameters(cTimes.getParameters())
      }, 's')
      .where(`s."possibleTimes" <> '{}'::tstzmultirange`)

    ;[1, 2, 3, 4, 5].map((n) => {
      qb.addSelect(
        's."possibleTimes" * ' +
          `'{[2001-01-0${n}, 2001-01-0${n + 1})}'::tstzmultirange`,
        n.toString(),
      )
    })

    // available times are split by dow
    type at = {
      1: string
      2: string
      3: string
      4: string
      5: string
      teacherId: number
      firstName: string
      lastName: string
      possibleTimes: string
    }

    const availableTeachers = await mainQuery.getRawMany<at>()

    const suggestions = await Promise.all(
      availableTeachers.map(async (a) => ({
        teacherId: a.teacherId,
        teacherName: a.firstName + ' ' + a.lastName,
        suggestions: await Promise.all(
          [1, 2, 3, 4, 5].flatMap((n) =>
            parseMultirange(a[n]).map(async (r) => ({
              ...r,
              overlap: (
                await this.checkOverlap(a.teacherId, dto.customers, r)
              ).map((c) => c.id),
            })),
          ),
        ),
      })),
    )

    return suggestions
  }

  async checkOverlap(
    teacherId: number,
    customers: number[],
    range: timeAvailable,
  ) {
    const qb = this.contractsRepository.createQueryBuilder('c')

    qb.select('c.id')
      .leftJoin('c.customers', 'customer')
      .leftJoin('c.teacher', 'teacher')
      .where('extract(dow from c.startDate) = :dow')
      .andWhere('c.startTime < :end::time')
      .andWhere('c.endTime > :start::time')
      .andWhere(
        new Brackets((qb) => {
          qb.where('teacher.id = :tid', { tid: teacherId }) //
            .orWhere('customer.id IN (:...cid)', { cid: customers })
        }),
      )
      .setParameters(range)

    return qb.getMany()
  }

  async remove(id: string): Promise<void> {
    const contract = await this.contractsRepository.findOne(id)

    if (dayjs().isBefore(contract.startDate)) {
      this.contractsRepository.delete(id)
    } else {
      throw new BadRequestException('contract cannot be deleted')
    }
  }

  async findByWeek(week: Dayjs, teacherId?: number): Promise<Contract[]> {
    const q = this.contractsRepository
      .createQueryBuilder('c')
      .leftJoin('c.subject', 'subject')
      .leftJoin('c.customers', 'customer')
      .select([
        'c',
        'subject',
        'customer.id',
        'customer.type',
        'customer.firstName',
        'customer.lastName',
        'customer.schoolName',
      ])
      .loadAllRelationIds({
        relations: ['teacher'],
      })
      .where(
        `c.startDate <= date_trunc('week', :week::date) + interval '4 day'`,
        { week: week.format() },
      )
      .andWhere(`c.endDate >= date_trunc('week', :week::date)`)
      .andWhere(
        `extract( days from ( date_trunc('week', c.startDate) - date_trunc('week', :week::date) ) ) / 7 % c.interval = 0`,
      )

    if (typeof teacherId !== 'undefined')
      q.andWhere('c.teacherId = :teacherId', { teacherId: teacherId })

    return q.getMany()
  }
}
