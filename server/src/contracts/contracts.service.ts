import { Injectable } from '@nestjs/common'
import { InjectConnection, InjectRepository } from '@nestjs/typeorm'
import { Dayjs } from 'dayjs'
import { Connection, Repository } from 'typeorm'

import { Customer, User } from 'src/users/entities'

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
  ) {
    this.initDb()
  }

  async initDb() {
    const runner = this.connection.createQueryRunner()

    await runner.connect()

    await runner.query(`
      CREATE or REPLACE FUNCTION int_tstzmultirange(a tstzmultirange, b tstzmultirange)
        returns tstzmultirange language plpgsql as
          'begin return a * b; end';

      CREATE or REPLACE AGGREGATE intersection ( tstzmultirange ) (
        SFUNC = int_tstzmultirange,
        STYPE = tstzmultirange,
        INITCOND = '{[,]}'
      );
    `)

    await runner.release()
  }

  create(dto: CreateContractDto): Promise<Contract> {
    const contract = this.contractsRepository.create(dto)

    return this.contractsRepository.save(contract)
  }

  async findAll(): Promise<Contract[]> {
    return this.contractsRepository.find({
      loadRelationIds: true,
    })
  }

  findOne(id: string): Promise<Contract> {
    return this.contractsRepository.findOne(id)
  }

  async suggestContracts(dto: SuggestContractsDto): Promise<any[]> {
    const dowFilter =
      typeof dto.dow !== 'undefined' ? [dto.dow] : [1, 2, 3, 4, 5]

    const dowTime = dowFilter.map((dow) => {
      const start = `[2001-01-0${dow} ${dto.startTime ?? '00:00'}, `
      const end =
        typeof dto.endTime !== 'undefined'
          ? `2001-01-0${dow} ${dto.endTime}]`
          : `2001-01-0${dow + 1} 00:00)` // exclusive bound of next day 00:00

      return start + end
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
      .setParameter('filter', dowTimeFilter)

    const mainQuery = qb
      .select('*')
      .from((subq) => {
        return subq
          .select('t.id', 'teacherId')
          .addSelect('t.timesAvailable * ' + cTimes.getQuery(), 'possibleTimes')
          .from(User, 't')
          .where('t.type = :tt', { tt: 'Teacher' })
          .setParameters(cTimes.getParameters())
      }, 's')
      .where(`s."possibleTimes" <> '{}'::tstzmultirange`)

    // console.log(mainQuery.getQueryAndParameters())

    return mainQuery.getRawMany()
  }

  async remove(id: string): Promise<void> {
    await this.contractsRepository.delete(id)
  }

  async findByWeek(week: Dayjs): Promise<Contract[]> {
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

    return q.getMany()
  }
}
