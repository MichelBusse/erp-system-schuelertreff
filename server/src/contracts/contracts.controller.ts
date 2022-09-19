import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  Query,
} from '@nestjs/common'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { EntityNotFoundError } from 'typeorm'

import { Roles } from 'src/auth/decorators/roles.decorator'
import { Role } from 'src/auth/role.enum'

import { Contract } from './contract.entity'
import { ContractsService } from './contracts.service'
import { AcceptOrDeclineContractDto } from './dto/accept-or-decline-contract-dto'
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
    const endDate = dto.endDate ? dayjs(dto.endDate) : null

    if (endDate && endDate.isBefore(startDate))
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

  @Get('findBlocked')
  @Roles(Role.ADMIN)
  async findBlocked(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('teacher') teacherId: number,
  ) {
    if (!dayjs(startDate).isValid() || !dayjs(endDate).isValid())
      throw new BadRequestException()

    return this.contractsService.findBlocked(startDate, endDate, teacherId)
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll(): Promise<Contract[]> {
    return this.contractsService.findAll()
  }

  @Get('pending')
  @Roles(Role.ADMIN)
  findAllPending(): Promise<Contract[]> {
    return this.contractsService.findAllPending()
  }

  @Get('school/me')
  findAllByMySchool(@Request() req) {
    return this.contractsService.findAllBySchool(req.user.id)
  }

  @Get('school/:id')
  @Roles(Role.ADMIN)
  findAllBySchool(@Param('id') id: number): Promise<Contract[]> {
    return this.contractsService.findAllBySchool(id)
  }

  @Get('privateCustomer/:id')
  @Roles(Role.ADMIN)
  findAllByPrivateCustomer(@Param('id') id: number): Promise<Contract[]> {
    return this.contractsService.findAllByPrivateCustomer(id)
  }

  @Get('teacher/:id')
  @Roles(Role.ADMIN)
  findAllByTeacher(@Param('id') id: number): Promise<Contract[]> {
    return this.contractsService.findAllByTeacher(id)
  }

  @Get('day')
  @Roles(Role.ADMIN)
  findByDay(@Query('date') date: string): Promise<Contract[]> {
    return this.contractsService.findByDay(date)
  }

  @Get('missingTeacher')
  @Roles(Role.ADMIN)
  findByMissingTeacher(): Promise<Contract[]> {
    return this.contractsService.findByMissingTeacher()
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: number): Promise<Contract> {
    return this.contractsService.findOne(id)
  }

  @Post('acceptOrDecline/:id')
  acceptOrDecline(
    @Param('id') id: number,
    @Body() dto: AcceptOrDeclineContractDto,
  ): void {
    this.contractsService.acceptOrDeclineContract(id, dto)
  }

  @Post(':id')
  @Roles(Role.ADMIN)
  async update(
    @Param('id') id: number,
    @Body() dto: CreateContractDto,
  ): Promise<void> {
    this.validateDto(dto)

    const contract = await this.contractsService.findOne(id)

    if (
      dayjs(dto.startDate).isAfter(dayjs()) ||
      (contract.teacher !== null && dto.teacher !== 'later'
        ? contract.teacher.id !== Number(dto.teacher)
        : contract.teacher !== null) ||
      (contract.teacher === null && dto.teacher !== 'later')
    ) {
      // If contract starts in future, then update existing contract

      this.contractsService.updateContract(id, dto)
    } else if (!dto.endDate || dayjs(dto.endDate).isAfter(dayjs())) {
      //If contract has already started and does not have ended yet, then end it and create new with updated params
      this.contractsService.endOrDeleteContract(id)

      this.contractsService.create(dto).catch((err) => {
        if (err instanceof EntityNotFoundError) {
          throw new BadRequestException(err.message)
        }

        throw err
      })
    } else {
      //Past contracts cannot be updated
      throw new BadRequestException('Cannot update past contracts')
    }
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  endOrDelete(@Param('id') id: number): Promise<void> {
    return this.contractsService.endOrDeleteContract(id)
  }
}
