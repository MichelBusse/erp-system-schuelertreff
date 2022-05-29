import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
} from '@nestjs/common'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

import { Roles } from 'src/auth/decorators/roles.decorator'
import { Role } from 'src/auth/role.enum'

import { Contract } from './contract.entity'
import { ContractsService } from './contracts.service'
import { CreateContractDto } from './dto/create-contract.dto'

dayjs.extend(customParseFormat)

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  private validateDto(dto: CreateContractDto) {
    const startTime = dayjs(dto.startTime, 'HH:mm')
    const endTime = dayjs(dto.endTime, 'HH:mm')

    if (dto.endDate < dto.startDate)
      throw new BadRequestException('endDate must not be before startDate')

    if (dayjs(dto.endDate).diff(dto.startDate, 'd') % (7 * dto.interval))
      throw new BadRequestException('invalid endDate')

    if (endTime.diff(startTime, 'm') < 30)
      throw new BadRequestException('endTime must be >= 30min after startTime')

    if (startTime.minute() % 5 || endTime.minute() % 5)
      throw new BadRequestException('only 5 minute steps allowed')
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateContractDto): Promise<Contract> {
    this.validateDto(dto)

    return this.contractsService.create(dto)
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll(): Promise<Contract[]> {
    return this.contractsService.findAll()
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: string): Promise<Contract> {
    return this.contractsService.findOne(id)
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string): Promise<void> {
    return this.contractsService.remove(id)
  }
}
