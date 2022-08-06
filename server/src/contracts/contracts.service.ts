import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import dayjs, { Dayjs } from 'dayjs'
import { Brackets, DataSource, Repository } from 'typeorm'

import { timeAvailable } from 'src/users/dto/timeAvailable'
import { Customer, Teacher, User } from 'src/users/entities'
import { parseMultirange, UsersService } from 'src/users/users.service'

import { Contract, ContractState } from './contract.entity'
import { AcceptOrDeclineContractDto } from './dto/accept-or-decline-contract-dto'
import { CreateContractDto } from './dto/create-contract.dto'
import { SuggestContractsDto } from './dto/suggest-contracts.dto'
import { SchoolType, TeacherSchoolType } from 'src/users/entities/user.entity'

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractsRepository: Repository<Contract>,

    @InjectDataSource()
    private connection: DataSource,

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

  async findAllPending(): Promise<Contract[]> {
    const contracts = this.contractsRepository
      .createQueryBuilder('c')
      .select(['c', 's', 't', 'customers', 'school'])
      .leftJoin('c.subject', 's')
      .leftJoin('c.teacher', 't')
      .leftJoin('c.customers', 'customers')
      .leftJoin('customers.school', 'school')
      .where('c.state != :contractState', {
        contractState: ContractState.ACCEPTED,
      })

    return contracts.getMany()
  }

  async findAllPendingForTeacher(teacherId): Promise<Contract[]> {
    const contracts = this.contractsRepository
      .createQueryBuilder('c')
      .select(['c', 's'])
      .leftJoin('c.subject', 's')
      .where('c.state = :contractState', {
        contractState: ContractState.PENDING,
      })
      .andWhere('c.teacherId = :teacherId', { teacherId: teacherId })

    return contracts.getMany()
  }

  async findOne(id: number, teacherId?: number): Promise<Contract> {
    const contract = await this.contractsRepository.findOne({
      where: { id },
      relations: ['subject', 'teacher', 'customers', 'customers.school'],
    })

    if (!(teacherId && contract.teacher.id !== teacherId)) {
      return contract
    } else {
      return null
    }
  }

  async endOrDeleteContract(id: number): Promise<void> {
    const contract = await this.contractsRepository.findOneByOrFail({ id })

    if (contract.state === ContractState.ACCEPTED) {
      if (dayjs().isBefore(contract.endDate)) {
        // Cannot delete past contracts
        if (dayjs().isBefore(contract.startDate)) {
          // Delete Future contracts completely
          this.contractsRepository.delete(id)
        } else {
          // End ongoing contracts
          this.contractsRepository.update(id, {
            endDate: dayjs().format('YYYY-MM-DD'),
          })
        }
      } else {
        throw new BadRequestException('Past contracts cannot be deleted')
      }
    } else {
      // Delete unaccepted contracts completely
      this.contractsRepository.delete(id)
    }
  }

  async updateContract(id: number, dto: CreateContractDto): Promise<void> {
    let contract: any = await this.contractsRepository.findOneBy({ id })

    contract = {
      ...contract,
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
    }

    await this.contractsRepository.save(contract)
  }

  async acceptOrDeclineContract(
    id: number,
    dto: AcceptOrDeclineContractDto,
  ): Promise<void> {
    let contract: any = await this.contractsRepository.findOneBy({ id })

    contract = {
      ...contract,
      ...dto,
    }

    await this.contractsRepository.save(contract)
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

    // get schoolTypes from customers
    
    const customers = await this.connection.createQueryBuilder().select('c').from(Customer, 'c').where('c.id IN (:...cid)', { cid: dto.customers }).getMany()

    const requestedSchoolTypes : TeacherSchoolType[] = []

    customers.forEach((customer) => {
      if(customer.schoolType && customer.schoolType !== SchoolType.ANDERE && customer.grade){
        switch(customer.schoolType){
          case SchoolType.GRUNDSCHULE:
            requestedSchoolTypes.push(TeacherSchoolType.GRUNDSCHULE)
            break;
          case SchoolType.OBERSCHULE:
            requestedSchoolTypes.push(TeacherSchoolType.OBERSCHULE)
            break;
          case SchoolType.GYMNASIUM:
            if(customer.grade < 11) {
              requestedSchoolTypes.push(TeacherSchoolType.GYMSEK1)
            }else{
              requestedSchoolTypes.push(TeacherSchoolType.GYMSEK2)
            }
            break;
        }
      }
    })

    // begin actual query

    const qb = this.connection.createQueryBuilder()

    /* CUSTOMER QUERY */

    const cTimes = qb
      .subQuery()
      .select('intersection(c."timesAvailable") * :filter::tstzmultirange')
      .from(Customer, 'c')
      .where('c.id IN (:...cid)', { cid: dto.customers })
      .having('count(c) = :cc', { cc: dto.customers.length })
      .setParameter('filter', dowTimeFilter)

    /* CONTRACT QUERY */

    const contractQuery = qb
      .subQuery()
      .select(
        `union_multirange((
      '{[2001-01-0' || extract(dow from "con"."startDate") || ' ' || "con"."startTime" ||
      ', 2001-01-0' || extract(dow from "con"."startDate") || ' ' || "con"."endTime" || ')}'
    )::tstzmultirange)`,
        'contractTimes',
      )
      .from(Contract, 'con')
      .leftJoin('con.customers', 'customer')
      .where(
        new Brackets((contractQuery) => {
          contractQuery
            .where('t.id = con.teacherId')
            .orWhere(`customer.id IN (:...cid)`, { cid: dto.customers })
        }),
      )
      .andWhere('con.state = :contractState', {
        contractState: ContractState.ACCEPTED,
      })
      .andWhere('con.endDate > :minDate', {
        minDate: dto.minDate ?? dayjs().format('YYYY-MM-DD'),
      })
    if (typeof dto.maxDate !== 'undefined')
      contractQuery.andWhere('con.startDate < :maxDate', {
        maxDate: dto.maxDate,
      })

    if (dto.interval !== 1) contractQuery.andWhere('con.interval = 1')

    /* MAIN QUERY */

    const mainQuery = qb
      .select('*')
      .from((subq) => {
        const sq = subq
          .select('t.id', 'teacherId')
          .addSelect('t.firstName', 'firstName')
          .addSelect('t.lastName', 'lastName')
          .addSelect(
            `
              t."timesAvailable"
              * ${cTimes.getQuery()}
              - ${contractQuery.getQuery()}
            `,
            'possibleTimes',
          )
          .addFrom(User, 't')
          .leftJoin('t.subjects', 'subject')
          .where('t.type = :tt', { tt: 'Teacher' })
          .andWhere(`t.state = 'employed'`)
          .andWhere('subject.id = :subjectId', { subjectId: dto.subjectId })
          .andWhere(
            new Brackets((qb) => {
              qb.where('cardinality(t.schoolTypes) = 0')
                .orWhere('t.schoolTypes @> :requestedSchoolTypes', {requestedSchoolTypes})
            }),
          )

        sq.groupBy('t.id')

        sq.setParameters(cTimes.getParameters())

        return sq
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
      .andWhere('c.state = :contractState', {
        contractState: ContractState.ACCEPTED,
      })
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

  async findByWeek(week: Dayjs, teacherId?: number): Promise<Contract[]> {
    const q = this.contractsRepository
      .createQueryBuilder('c')
      .leftJoin('c.subject', 'subject')
      .leftJoin('c.customers', 'customer')
      .leftJoin('customer.school', 'school')
      .select([
        'c',
        'subject',
        'customer',
        'school'
      ])
      .loadAllRelationIds({
        relations: ['teacher'],
      })
      .where(
        `c.startDate <= date_trunc('week', :week::date) + interval '4 day'`,
        { week: week.format() },
      )
      .andWhere(`c.endDate >= date_trunc('week', :week::date)`)
      .andWhere('c.state = :contractState', {
        contractState: ContractState.ACCEPTED,
      })
      .andWhere(
        `extract( days from ( date_trunc('week', c.startDate) - date_trunc('week', :week::date) ) ) / 7 % c.interval = 0`,
      )

    if (typeof teacherId !== 'undefined')
      q.andWhere('c.teacherId = :teacherId', { teacherId: teacherId })

    return q.getMany()
  }
}
