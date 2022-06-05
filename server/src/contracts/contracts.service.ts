import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Dayjs } from 'dayjs'
import { Repository } from 'typeorm'

import { Contract } from './contract.entity'
import { CreateContractDto } from './dto/create-contract.dto'

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractsRepository: Repository<Contract>,
  ) {}

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

    console.log(q.getQueryAndParameters())

    return q.getMany()
  }
}
