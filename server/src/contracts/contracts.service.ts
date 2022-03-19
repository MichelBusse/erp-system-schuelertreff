import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContractDto } from './dto/create-contract.dto';
import { Contract } from './contract.entity';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractsRepository: Repository<Contract>,
  ) {}

  create(createContractDto: CreateContractDto): Promise<Contract> {
    const contract = new Contract();

    contract.customers = createContractDto.customers;
    contract.teacher = createContractDto.teacher;
    contract.subject = createContractDto.subject;
    contract.weekday = createContractDto.weekday;
    contract.from = createContractDto.from;
    contract.to = createContractDto.to;
    contract.startDate = createContractDto.startDate;
    contract.endDate = createContractDto.endDate;
    contract.frequency = createContractDto.frequency;

    return this.contractsRepository.save(contract);
  }

  async findAll(): Promise<Contract[]> {
    return this.contractsRepository.find({
      loadRelationIds: true,
    });
  }

  findOne(id: string): Promise<Contract> {
    return this.contractsRepository.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.contractsRepository.delete(id);
  }
}
