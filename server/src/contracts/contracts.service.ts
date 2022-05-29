import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
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
}
