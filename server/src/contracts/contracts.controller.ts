import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
} from '@nestjs/common'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { EntityNotFoundError, UpdateResult } from 'typeorm'

import { Roles } from 'src/auth/decorators/roles.decorator'
import { Role } from 'src/auth/role.enum'

import { Contract } from './contract.entity'
import { ContractsService } from './contracts.service'
import { CreateContractDto } from './dto/create-contract.dto'
import { SuggestContractsDto } from './dto/suggest-contracts.dto'

dayjs.extend(customParseFormat)

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  private validateDto(dto: CreateContractDto) {
    const startTime = dayjs(dto.startTime, 'HH:mm')
    const endTime = dayjs(dto.endTime, 'HH:mm')
    const startDate = dayjs(dto.startDate)
    const endDate = dayjs(dto.endDate)

    if (endDate.isBefore(startDate))
      throw new BadRequestException('endDate must not be before startDate')

    if ([0, 6].includes(startDate.day()))
      throw new BadRequestException('invalid day of week')

    if (endTime.diff(startTime, 'm') < 30)
      throw new BadRequestException('endTime must be >= 30min after startTime')

    if (startTime.minute() % 5 || endTime.minute() % 5)
      throw new BadRequestException('only 5 minute steps allowed')
  }

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() dto: CreateContractDto): Promise<Contract> {
    this.validateDto(dto)

    return this.contractsService.create(dto).catch((err) => {
      if (err instanceof EntityNotFoundError) {
        throw new BadRequestException(err.message)
      }

      throw err
    })
  }

  @Get('suggest')
  @Roles(Role.ADMIN)
  suggestContracts(@Query() dto: SuggestContractsDto): Promise<Contract[]> {
    return this.contractsService.suggestContracts(dto)
  }

  @Get('myContracts')
  findMyContracts(
    @Request() req,
    @Query('of') date: string,
  ): Promise<Contract[]> {
    return this.contractsService.findByWeek(dayjs(date), req.user.id)
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

  @Post(':id')
  @Roles(Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: CreateContractDto,
  ): Promise<Contract> {
    this.validateDto(dto)

    if (dayjs(dto.startDate).isAfter(dayjs())) {    // If contract starts in future, then update excestingcontract 

      this.contractsService.updateContract(id, dto)

    } else if(dayjs(dto.endDate).isAfter(dayjs())) { //If contract has already started and does not have ended yet, then end it and create new with updated params
      this.contractsService.endOrDeleteContract(id)

      return this.contractsService.create(dto).catch((err) => {
        if (err instanceof EntityNotFoundError) {
          throw new BadRequestException(err.message)
        }

        throw err
      })
    } else { //Past contracts cannot be updated
      throw new BadRequestException("Cannot update past contracts")
    }
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  endOrDelete(@Param('id') id: string): Promise<void> {
    return this.contractsService.endOrDeleteContract(id)
  }
}
