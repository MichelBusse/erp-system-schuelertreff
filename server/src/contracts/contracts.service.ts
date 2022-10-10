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

    if (dto.customers.length === 0 && dto.schoolId) {
      // If no customers but a schoolId is set, use or create DefaultClassCustomer of school
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
      // If initial contract is set, handle eventual deletion of initialContract
      const initialContract = await this.contractsRepository.findOneByOrFail({
        id: dto.initialContractId,
      })

      if (dayjs(initialContract.startDate).isAfter(dayjs(dto.startDate))) {
        //if initialContract starts after editedContract -> delete initial contract completely and cascade to all of its lessons
        this.contractsRepository.delete({ id: dto.initialContractId })
      } else if (
        !initialContract.endDate ||
        (dayjs().isBefore(dayjs(initialContract.endDate)) &&
          dayjs(dto.startDate).isBefore(dayjs(initialContract.endDate)))
      ) {
        // If initialContract has not ended yet and ends after the editedContracts startDate, end it one day before the startDate of the editedContract
        initialContract.endDate = dayjs(dto.startDate)
          .subtract(1, 'day')
          .format('YYYY-MM-DD')
        const updatedContract = await this.contractsRepository.save(
          initialContract,
        )

        // Delete all Lessons which are now out of bounds
        this.lessonsService.findAndValidateAllByContract(updatedContract)
      }
    }

    return savedContract
  }

  async findAll(): Promise<Contract[]> {
    return this.contractsRepository.find({
      loadRelationIds: true,
    })
  }

  // Find all contracts which are not accepted
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

  // Find all contracts for one teacher which are in state 'pending'
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
      .andWhere('(c.endDate IS NULL OR c.endDate <= now())')

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

  // Find all ongoing or future contracts of one school
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

  // Find all ongoing or future contracts of one PrivateCustomer
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

  // Find all ongoing or future contracts of one Teacher
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

  // Find all contracts of one day
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

  // Find all ongoing or future contracts without a teacher set yet
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
        if (dayjs().isBefore(contract.startDate)) {
          // Delete Future contracts completely
          this.contractsRepository.delete(id)
        } else {
          // End ongoing contracts today
          this.contractsRepository.update(id, {
            endDate: dayjs().format('YYYY-MM-DD'),
          })
        }
      } else {
        // Cannot delete past contracts
        throw new BadRequestException(
          'Vergangene Verträge (oder Verträge, die heute enden) können nicht beendet werden',
        )
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
    let customers = []

    // get SchoolTypes from customers
    if (dto.customers.length > 0)
      customers = await this.connection
        .createQueryBuilder()
        .select('c')
        .from(Customer, 'c')
        .andWhere('c.id IN (:...cid)', { cid: dto.customers })
        .getMany()

    const requiredTeacherSchoolTypes: TeacherSchoolType[] = []

    //Determine required TeacherSchoolTypes by mapping SchoolTypes of Customers
    customers.forEach((customer) => {
      if (
        customer.schoolType &&
        customer.schoolType !== SchoolType.ANDERE &&
        customer.grade
      ) {
        switch (customer.schoolType) {
          case SchoolType.GRUNDSCHULE:
            requiredTeacherSchoolTypes.push(TeacherSchoolType.GRUNDSCHULE)
            break
          case SchoolType.OBERSCHULE:
            requiredTeacherSchoolTypes.push(TeacherSchoolType.OBERSCHULE)
            break
          case SchoolType.GYMNASIUM:
            if (customer.grade < 11) {
              requiredTeacherSchoolTypes.push(TeacherSchoolType.GYMSEK1)
            } else {
              requiredTeacherSchoolTypes.push(TeacherSchoolType.GYMSEK2)
            }
            break
        }
      }
    })

    // Get the avaiable times of all customers
    const customerTimes = this.connection
      .createQueryBuilder()
      .select('intersection(c."timesAvailable")', 'customerTimes')
      .from(Customer, 'c')
    if (dto.customers.length > 0) {
      customerTimes.where('c.id IN (:...cid)', { cid: dto.customers })
    } else {
      customerTimes.where('1 = 0')
    }
    customerTimes.having('count(c) = :cc', { cc: dto.customers.length })

    /** Get all times which are blocked by relevant contracts (within start and endDate).
     * If the week interval of the new contract is higher than 1, use only contracts with interval 1
     * (others are handled by '*'-text in checkOverlap)
     * Either contracts of all customers or of all customers and the teacher
     * */
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
            if (dto.customers.length > 0) {
              qb.where(`customer.id IN (:...cid)`, {
                cid: dto.customers,
              })
            } else {
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

    // Optional Time Filter according to the user (whether he has already specified a weekday or timespan)
    let optionalTimeFilter = ``
    if (dto.dow) {
      optionalTimeFilter = `* '{[2001-01-0${dto.dow} ${
        dto.startTime ?? '00:00'
      }, 2001-01-0${dto.dow} ${dto.endTime ?? '24:00'})}'::tstzmultirange`
    } else {
      if (dto.startTime && dto.endTime) {
        optionalTimeFilter = `* ${[1, 2, 3, 4, 5]
          .map((d) => {
            ;`[2001-01-0${d} ${dto.startTime ?? '00:00'}, 2001-01-0${d} ${
              dto.endTime ?? '24:00'
            })`
          })
          .join(',')}}'::tstzmultirange`
      }
    }

    /**
     * Main Query:
     * Get intersection of TeacherTimesAvailable, CustomerTimesAvaiable and the optional TimeFilter
     * and subtract all blocked timespans of contracts from the teacher and customers
     * */
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
              qb.orWhere(
                't.teacherSchoolTypes @> :requiredTeacherSchoolTypes',
                {
                  requiredTeacherSchoolTypes,
                },
              )
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

    /**
     * Times without teacher query:
     * Get intersection only of CustomerTimesAvaiable and the optional TimeFilter
     * and subtract all blocked timespans of contracts from the customers to
     * get time suggestions without a teacher specified
     * */
    const availableTimesWithoutTeacherQuery = this.connection
      .createQueryBuilder()
      .select('*')
      .from((subq) => {
        const sq = subq
          .select('-1', 'teacherId')
          .addSelect('', 'firstName')
          .addSelect('', 'lastName')
          .addSelect(
            `("customerTimes") ${optionalTimeFilter} - ("contractTimes")`,
            'possibleTimes',
          )
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

    // Add the time suggestions without teacher infront of the time suggestions
    availableTeachers = availableTimesWithoutTeacher.concat(availableTeachers)

    /** Process all time suggestions in a useful format for the frontend and use 'checkOverlap' to add a '*' in the frontend
     * to all suggestions where some contracts with the interval > 1 are within the suggested timespan
     */
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
                overlap:
                  dto.interval > 1
                    ? (
                        await this.checkOverlap(
                          a.teacherId,
                          dto.customers,
                          r,
                          dto.ignoreContracts,
                          dto.startDate,
                          dto.endDate,
                        )
                      ).map((c) => c.id)
                    : [],
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

  /** 'checkOverlap' to add a '*' in the frontend
   * to all suggestions where some contracts with the interval > 1 are within the suggested timespan
   * the function returns all contracts which are within that timespan
   */
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
      .andWhere('(c.endDate IS NULL OR c.endDate > :startDate::date)', {
        startDate,
      })
      .andWhere(
        new Brackets((qb) => {
          qb.where('teacher.id = :tid', { tid: teacherId })

          if (customers.length > 0) {
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

  // Find all accepted contracts of the specified week and optionally one specified teacher
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
          // endDate has to be higher than the dayOfWeek of the contract
          qb.orWhere(
            `c.endDate >= date_trunc('week', :week::date) + (extract(isodow from "c"."startDate")::text || ' day')::INTERVAL`,
          )
        }),
      )
      .andWhere('c.state = :contractState', {
        contractState: ContractState.ACCEPTED,
      })
      // Handle interval > 1
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
      .andWhere(`c."startDate" <= :end::date`, { end: endDate })
      .andWhere(
        new Brackets((qb) => {
          qb.where('c."endDate" IS NULL')
          qb.orWhere(`c."endDate" >= :start::date`, { start: startDate })
        }),
      )
      // trick typeorm to map "lessons_" properties to c.lessons
      .leftJoin('c.lessons', 'lessons', 'false')
      // get all possible lesson dates for each contract
      .leftJoinAndMapMany(
        'c.lessons',
        (qb) => {
          // hack: override getQuery method because QueryBuilder does not allow 'generate_series' in FROM
          qb.getQuery = () => `(
            select
              c.id "contractId",
              lesson "lessons_date",
              (c.id || ' ' || lesson) "lessons_id"
            from
              contract c,
              generate_series(
                c."startDate",
                least(c."endDate", :end::date),
                (c."interval" || ' week')::interval
              ) lesson
            where
              lesson >= :start::date
              and c."teacherId" = :teacherId
          )`
          return qb
        },
        'fakelessons',
        `"fakelessons"."contractId" = c.id`,
      )
      .addSelect('lessons.date')
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
