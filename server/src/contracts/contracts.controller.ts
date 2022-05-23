import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common'

import { Contract } from './contract.entity'
import { ContractsService } from './contracts.service'
import { CreateContractDto } from './dto/create-contract.dto'

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  create(@Body() createContractDto: CreateContractDto): Promise<Contract> {
    return this.contractsService.create(createContractDto)
  }

  @Get()
  findAll(): Promise<Contract[]> {
    return this.contractsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Contract> {
    return this.contractsService.findOne(id)
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.contractsService.remove(id)
  }
}
