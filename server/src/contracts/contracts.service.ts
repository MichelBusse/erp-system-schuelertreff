import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import dayjs, { Dayjs } from 'dayjs'
import { Brackets, DataSource, Repository } from 'typeorm'

import { LessonsService } from 'src/lessons/lessons.service'
import { timeAvailable } from 'src/users/dto/timeAvailable'
import { Customer, User } from 'src/users/entities'
import { SchoolType, TeacherSchoolType } from 'src/users/entities/user.entity'
import { parseMultirange, UsersService } from 'src/users/users.service'

import { Contract, ContractState } from './contract.entity'
import { AcceptOrDeclineContractDto } from './dto/accept-or-decline-contract-dto'
import { CreateContractDto } from './dto/create-contract.dto'
import { SuggestContractsDto } from './dto/suggest-contracts.dto'

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractsRepository: Repository<Contract>,

    @InjectDataSource()
    private connection: DataSource,

    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    @Inject(forwardRef(() => LessonsService))
    private readonly lessonsService: LessonsService,
  ) {}

  async create(dto: CreateContractDto): Promise<Contract> {
    if (dto.customers.length === 0 && !dto.schoolId)
      throw new BadRequestException('Customers should not be empty')

    // Case of default ClassCustomer
    if (dto.customers.length === 0 && dto.schoolId) {
      dto.customers.push(
        (await this.usersService.findOrCreateDefaultClassCustomer(dto.schoolId))
          .id,
      )
    }

    const contract = this.contractsRepository.create({
      ...dto,
      subject: { id: dto.subject },
      teacher:
        dto.teacher !== 'later'
          ? await this.usersService
              .findOneTeacher(Number(dto.teacher))
              .then((c) => ({ id: c.id }))
          : null,
      customers: await Promise.all(
        dto.customers.map((id) =>
          this.usersService.findOneCustomer(id).then((c) => ({ id: c.id })),
        ),
      ),
      parentContract: dto.parentContract ? { id: dto.parentContract } : null,
    })

    const savedContract = await this.contractsRepository.save(contract)

    if (savedContract.state === ContractState.ACCEPTED)
      await this.lessonsService.cancelByContract(savedContract)

    if (dto.initialContractId) {
      const initialContract = await this.contractsRepository.findOneByOrFail({
        id: dto.initialContractId,
      })

      if (dayjs(initialContract.startDate).isAfter(dayjs())) {
        this.contractsRepository.delete({ id: dto.initialContractId })
      } else {
        initialContract.endDate = dayjs().format('YYYY-MM-DD')
        await this.contractsRepository.save(initialContract)
      }
    }

    return savedContract
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
      .select(['c', 's', 't', 'customers', 'school'])
      .leftJoin('c.subject', 's')
      .leftJoin('c.customers', 'customers')
      .leftJoin('customers.school', 'school')
      .leftJoin('c.teacher', 't')
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

  async findAllBySchool(schoolId): Promise<Contract[]> {
    const contracts = this.contractsRepository
      .createQueryBuilder('c')
      .select(['c', 's', 'customer', 'school'])
      .leftJoin('c.subject', 's')
      .leftJoin('c.customers', 'customer')
      .leftJoin('customer.school', 'school')
      .leftJoinAndSelect('c.teacher', 't')
      .where('customer.school IS NOT NULL AND customer.school.id = :schoolId', {
        schoolId: schoolId,
      })
      .andWhere('(c.endDate IS NULL OR c.endDate > now())')
      .orderBy('c.startDate', 'ASC')
      .addOrderBy('c.startTime', 'ASC')

    return contracts.getMany()
  }

  async findAllByPrivateCustomer(privateCustomerId): Promise<Contract[]> {
    const contracts = this.contractsRepository
      .createQueryBuilder('c')
      .select(['c', 's', 'customer', 'school'])
      .leftJoin('c.subject', 's')
      .leftJoin('c.customers', 'customer')
      .leftJoin('customer.school', 'school')
      .leftJoinAndSelect('c.teacher', 't')
      .where('customer.id = :privateCustomerId', {
        privateCustomerId: privateCustomerId,
      })
      .andWhere('(c.endDate IS NULL OR c.endDate > now())')
      .orderBy('c.startDate', 'ASC')
      .addOrderBy('c.startTime', 'ASC')

    return contracts.getMany()
  }

  async findAllByTeacher(teacherId): Promise<Contract[]> {
    const contracts = this.contractsRepository
      .createQueryBuilder('c')
      .select(['c', 's', 'customer', 'school'])
      .leftJoin('c.subject', 's')
      .leftJoin('c.customers', 'customer')
      .leftJoin('customer.school', 'school')
      .leftJoinAndSelect('c.teacher', 't')
      .where('id IS NOT NULL AND t.id = :teacherId', { teacherId: teacherId })
      .andWhere('(c.endDate IS NULL OR c.endDate > now())')
      .orderBy('c.startDate', 'ASC')
      .addOrderBy('c.startTime', 'ASC')

    return contracts.getMany()
  }

  async findByDay(date: string): Promise<Contract[]> {
    const contracts = this.contractsRepository
      .createQueryBuilder('c')
      .select(['c', 's', 'customer', 'school'])
      .leftJoin('c.subject', 's')
      .leftJoin('c.customers', 'customer')
      .leftJoin('customer.school', 'school')
      .leftJoinAndSelect('c.teacher', 't')
      .where('extract(isodow from c.startDate) = :dow', {
        dow: dayjs(date, 'YYYY-MM-DD').day(),
      })
      .andWhere('c.startDate <= :inputDate', {
        inputDate: dayjs(date, 'YYYY-MM-DD').format('YYYY-MM-DD'),
      })
      .andWhere('(c.endDate IS NULL OR c.endDate >= :inputDate)', {
        inputDate: dayjs(date, 'YYYY-MM-DD').format('YYYY-MM-DD'),
      })
      .andWhere(
        new Brackets((qb) => {
          qb.where('c.endDate IS NULL')
          qb.orWhere('c.endDate >= :inputDate', {
            inputDate: dayjs(date, 'YYYY-MM-DD').format('YYYY-MM-DD'),
          })
        }),
      )
      .orderBy('c.startDate', 'ASC')
      .addOrderBy('c.startTime', 'ASC')

    return contracts.getMany()
  }

  async findByMissingTeacher(): Promise<Contract[]> {
    const contracts = this.contractsRepository
      .createQueryBuilder('c')
      .select(['c', 's', 'customer', 'school'])
      .leftJoin('c.subject', 's')
      .leftJoin('c.customers', 'customer')
      .leftJoin('customer.school', 'school')
      .leftJoinAndSelect('c.teacher', 't')
      .where('c.teacher IS NULL')
      .andWhere('c.endDate > now()')
      .orderBy('c.startDate', 'ASC')
      .addOrderBy('c.startTime', 'ASC')

    return contracts.getMany()
  }

  async endOrDeleteContract(id: number): Promise<void> {
    const contract = await this.contractsRepository.findOneByOrFail({ id })

    if (contract.state === ContractState.ACCEPTED) {
      if (!contract.endDate || dayjs().isBefore(contract.endDate)) {
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
        throw new BadRequestException('Vergangene Verträge (oder Verträge, die heute enden) können nicht beendet werden')
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
      teacher:
        dto.teacher !== 'later'
          ? await this.usersService
              .findOneTeacher(Number(dto.teacher))
              .then((c) => ({ id: c.id }))
          : null,
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
    const contract = await this.contractsRepository
      .createQueryBuilder('c')
      .select('c')
      .where('c.id = :id', { id })
      .leftJoin('c.teacher', 't')
      .addSelect('t.id')
      .getOne()

    const newContract = {
      ...contract,
      ...dto,
    }

    // cancel blocked lessons
    if (dto.state === ContractState.ACCEPTED)
      await this.lessonsService.cancelByContract(newContract)

    await this.contractsRepository.save(newContract)
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
    let customers = []

    if (dto.customers.length > 0)
      customers = await this.connection
        .createQueryBuilder()
        .select('c')
        .from(Customer, 'c')
        .andWhere('c.id IN (:...cid)', { cid: dto.customers })
        .getMany()

    const requestedSchoolTypes: TeacherSchoolType[] = []

    customers.forEach((customer) => {
      if (
        customer.schoolType &&
        customer.schoolType !== SchoolType.ANDERE &&
        customer.grade
      ) {
        switch (customer.schoolType) {
          case SchoolType.GRUNDSCHULE:
            requestedSchoolTypes.push(TeacherSchoolType.GRUNDSCHULE)
            break
          case SchoolType.OBERSCHULE:
            requestedSchoolTypes.push(TeacherSchoolType.OBERSCHULE)
            break
          case SchoolType.GYMNASIUM:
            if (customer.grade < 11) {
              requestedSchoolTypes.push(TeacherSchoolType.GYMSEK1)
            } else {
              requestedSchoolTypes.push(TeacherSchoolType.GYMSEK2)
            }
            break
        }
      }
    })

    // begin actual query

    /* CUSTOMER QUERY */

    const customerTimes = this.connection
      .createQueryBuilder()
      .select(
        'intersection(c."timesAvailable") * :filter::tstzmultirange',
        'customerTimes',
      )
      .from(Customer, 'c')
    if (dto.customers.length > 0) {
      customerTimes.where('c.id IN (:...cid)', { cid: dto.customers })
    } else {
      customerTimes.where('1 = 0')
    }
    customerTimes.having('count(c) = :cc', { cc: dto.customers.length })
    customerTimes.setParameter('filter', dowTimeFilter)

    /* CONTRACT QUERY */

    const contractTimes = (withTeacher: boolean) => {
      const qb = this.connection
        .createQueryBuilder()
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
          new Brackets((qb) => {
            if(dto.customers.length > 0){
              qb.where(`customer.id IN (:...cid)`, {
                cid: dto.customers,
              })
            }else{
              qb.where('1 = 0')
            }
            
            if (withTeacher) qb.orWhere('t.id = con.teacherId')
          }),
        )
        .andWhere('con.state = :contractState', {
          contractState: ContractState.ACCEPTED,
        })
        .andWhere(
          new Brackets((qb) => {
            qb.where('con.endDate IS NULL')
            qb.orWhere('con.endDate > :startDate', {
              startDate: dto.startDate ?? dayjs().format('YYYY-MM-DD'),
            })
          }),
        )

      if (typeof dto.endDate !== 'undefined')
        qb.andWhere('con.startDate < :endDate', {
          endDate: dto.endDate,
        })

      if (dto.interval !== 1) qb.andWhere('con.interval = 1')

      if (dto.ignoreContracts.length)
        qb.andWhere('con.id NOT IN (:...ignoreContracts)', {
          ignoreContracts: dto.ignoreContracts,
        })

      return qb
    }

    // Preset time resetrictions

    let optionalTimeFilter = ``
    if(dto.dow){
      `* '{[2001-01-0${dto.dow} ${dto.startTime ?? ''}, 2001-01-0${dto.dow + 1} ${dto.endTime ?? ''})}'::tstzmultirange`
    }else{
      if(dto.startTime && dto.endTime){
        `* ${[1,2,3,4,5].map((d) => {
          `[2001-01-0${d} ${dto.startTime}, 2001-01-0${d+1} ${dto.endTime})`
        }).join(',')}}'::tstzmultirange`
      }
    }

    /* MAIN QUERY */

    const mainQuery = this.connection
      .createQueryBuilder()
      .select('*')
      .from((subq) => {
        const sq = subq
          .select('t.id', 'teacherId')
          .addSelect('t.firstName', 'firstName')
          .addSelect('t.lastName', 'lastName')
          .addSelect(
            `
              t."timesAvailable"
              * (${customerTimes.getQuery()})
              ${optionalTimeFilter}
              - (${contractTimes(true).getQuery()})
            `,
            'possibleTimes',
          )
          .addFrom(User, 't')
          .leftJoin('t.subjects', 'subject')
          .where('t.type = :tt', { tt: 'Teacher' })
          .andWhere(`t.state = 'employed'`)
          .andWhere(`t.deleteState = 'active'`)
          .andWhere('subject.id = :subjectId', { subjectId: dto.subjectId })
          .andWhere(
            new Brackets((qb) => {
              qb.where('cardinality(t.teacherSchoolTypes) = 0')
              qb.orWhere('t.teacherSchoolTypes @> :requestedSchoolTypes', {
                requestedSchoolTypes,
              })
            }),
          )

        // suggestSubstitute: filter out original teacher
        if (dto.originalTeacher)
          sq.andWhere(`t.id <> :blockTeacher`, {
            blockTeacher: dto.originalTeacher,
          })

        sq.groupBy('t.id')

        sq.setParameters(customerTimes.getParameters())
        sq.setParameters(contractTimes(true).getParameters())

        return sq
      }, 's')
      .where(`s."possibleTimes" <> '{}'::tstzmultirange`)

    ;[1, 2, 3, 4, 5].map((n) => {
      mainQuery.addSelect(
        's."possibleTimes" * ' +
          `'{[2001-01-0${n}, 2001-01-0${n + 1})}'::tstzmultirange`,
        n.toString(),
      )
    })

    /* TIMES WITHOUT TEACHER QUERY */

    const availableTimesWithoutTeacherQuery = this.connection
      .createQueryBuilder()
      .select('*')
      .from((subq) => {
        const sq = subq
          .select('-1', 'teacherId')
          .addSelect('', 'firstName')
          .addSelect('', 'lastName')
          .addSelect(`("customerTimes") - ("contractTimes")`, 'possibleTimes')
          .from('(' + customerTimes.getQuery() + ')', 'customerTimes')
          .addFrom('(' + contractTimes(false).getQuery() + ')', 'contractTimes')

        sq.setParameters(customerTimes.getParameters())
        sq.setParameters(contractTimes(false).getParameters())

        return sq
      }, 's')
      .where(`s."possibleTimes" <> '{}'::tstzmultirange`)

    ;[1, 2, 3, 4, 5].map((n) => {
      availableTimesWithoutTeacherQuery.addSelect(
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

    let availableTeachers = await mainQuery.getRawMany<at>()
    const availableTimesWithoutTeacher =
      await availableTimesWithoutTeacherQuery.getRawMany<at>()

    availableTeachers = availableTimesWithoutTeacher.concat(availableTeachers)

    const suggestions = await Promise.all(
      availableTeachers.map(async (a) => ({
        teacherId: a.teacherId,
        teacherName: a.firstName + ' ' + a.lastName,
        suggestions: await Promise.all(
          [1, 2, 3, 4, 5].flatMap((n) =>
            parseMultirange(a[n])
              .filter((r) => this.durationMinutes(r) >= 45)
              .map(async (r) => ({
                ...r,
                overlap: (
                  await this.checkOverlap(
                    a.teacherId,
                    dto.customers,
                    r,
                    dto.ignoreContracts,
                    dto.startDate,
                    dto.endDate,
                  )
                ).map((c) => c.id),
              })),
          ),
        ),
      })),
    )

    return suggestions
  }

  durationMinutes(range: timeAvailable): number {
    return dayjs('2001-01-01 ' + range.end).diff(
      '2001-01-01 ' + range.start,
      'minute',
    )
  }

  async checkOverlap(
    teacherId: number,
    customers: number[],
    range: timeAvailable,
    ignoreContracts: number[],
    startDate?: string,
    endDate?: string | null,
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
      .andWhere('c.endDate > :startDate::date', { startDate })
      .andWhere(
        new Brackets((qb) => {
          qb.where('teacher.id = :tid', { tid: teacherId })

          if(customers.length > 0){
            qb.orWhere('customer.id IN (:...cid)', { cid: customers })
          }
        }),
      )
      .setParameters(range)

    if (endDate) qb.andWhere('c.startDate < :endDate::date', { endDate })

    if (ignoreContracts.length)
      qb.andWhere('c.id NOT IN (:...ignoreContracts)', {
        ignoreContracts,
      })

    return qb.getMany()
  }

  async findByWeek(week: Dayjs, teacherId?: number): Promise<Contract[]> {
    const q = this.contractsRepository
      .createQueryBuilder('c')
      .leftJoin('c.subject', 'subject')
      .leftJoin('c.customers', 'customer')
      .leftJoin('customer.school', 'school')
      .leftJoin('c.teacher', 'teacher')
      .select(['c', 'subject', 'customer', 'school', 'teacher'])
      .where(
        `c.startDate <= date_trunc('week', :week::date) + interval '4 day'`,
        { week: week.format() },
      )
      .andWhere(
        new Brackets((qb) => {
          qb.where('c.endDate IS NULL')
          qb.orWhere(
            `c.endDate >= date_trunc('week', :week::date) + (extract(isodow from "c"."startDate")::text || ' day')::INTERVAL`,
          )
        }),
      )
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

  /**
   * find blocked contracts of teacher between dates
   */
  async findBlocked(
    startDate: string,
    endDate: string,
    teacherId: number,
  ): Promise<Contract[]> {
    const qb = this.connection.createQueryBuilder()

    qb.select('c')
      .from(Contract, 'c')
      .where(`c."teacherId" = :teacherId`, { teacherId })
      .andWhere(`c.state = :state`, { state: ContractState.ACCEPTED })

    if (endDate !== null)
      qb.andWhere(`c."startDate" <= :end::date`, { end: endDate })

    qb.andWhere(
      new Brackets((qb) => {
        qb.where('c."endDate" IS NULL')
        qb.orWhere(`c."endDate" >= :start::date`, { start: startDate })
      }),
    )
      .leftJoinAndSelect('c.lessons', 'lesson')
      .andWhere(`lesson.date >= :start::date`)
      .andWhere(`lesson.date <= :end::date`)
      .leftJoinAndSelect(
        'c.childContracts',
        'cc',
        `cc."startDate" <= :end::date AND (cc."endDate" IS NULL OR cc."endDate" >= :start::date)`,
      )
      .leftJoinAndSelect('cc.teacher', 'cc_teacher')
      .leftJoin('c.customers', 'customer')
      .addSelect('customer.id')
      .leftJoinAndSelect('c.subject', 'subject')
      .leftJoin('c.teacher', 'teacher')
      .addSelect('teacher.id')

    const contracts: Contract[] = await qb.getMany()

    // if no lessons (between given dates) are found, contract is not affected
    return contracts.filter((c) => c.lessons.length > 0)
  }
}
