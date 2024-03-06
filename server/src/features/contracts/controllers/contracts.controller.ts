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
import { EntityNotFoundError } from 'typeorm'
import { CreateContractDto } from '../dto/create-contract.dto'
import { ContractsService } from '../services/contracts.service'
import UserRole from 'src/core/enums/UserRole.enum'
import { Contract } from '../entities/Contract.entity'
import { SuggestTimeSlotsDto } from '../dto/suggest-time-slots.dto'
import { AcceptOrDeclineContractDto } from '../dto/accept-or-decline-contract-dto'
import { Roles } from 'src/core/decorators/roles.decorator'

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
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CreateContractDto): Promise<Contract> {
    this.validateDto(dto)

    return this.contractsService.createOrUpdate(dto).catch((err) => {
      if (err instanceof EntityNotFoundError) {
        throw new BadRequestException(err.message)
      }

      throw err
    })
  }

  @Get('suggest')
  @Roles(UserRole.ADMIN)
  suggestContracts(@Query() dto: SuggestTimeSlotsDto): Promise<Contract[]> {
    return this.contractsService.suggestContracts(dto)
  }

  @Get('findBlocked')
  @Roles(UserRole.ADMIN)
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
  @Roles(UserRole.ADMIN)
  findAll(): Promise<Contract[]> {
    return this.contractsService.findAll()
  }

  @Get('pending')
  @Roles(UserRole.ADMIN)
  findAllPending(): Promise<Contract[]> {
    return this.contractsService.findAllPending()
  }

  @Get('school/me')
  findAllByMySchool(@Request() req) {
    return this.contractsService.findAllBySchool(req.user.id)
  }

  @Get('school/:id')
  @Roles(UserRole.ADMIN)
  findAllBySchool(@Param('id') id: number): Promise<Contract[]> {
    return this.contractsService.findAllBySchool(id)
  }

  @Get('privateCustomer/:id')
  @Roles(UserRole.ADMIN)
  findAllByPrivateCustomer(@Param('id') id: number): Promise<Contract[]> {
    return this.contractsService.findAllByPrivateCustomer(id)
  }

  @Get('teacher/:id')
  @Roles(UserRole.ADMIN)
  findAllByTeacher(@Param('id') id: number): Promise<Contract[]> {
    return this.contractsService.findAllByTeacher(id)
  }

  @Get('day')
  @Roles(UserRole.ADMIN)
  findByDay(@Query('date') date: string): Promise<Contract[]> {
    return this.contractsService.findByDay(date)
  }

  @Get('missingTeacher')
  @Roles(UserRole.ADMIN)
  findByMissingTeacher(): Promise<Contract[]> {
    return this.contractsService.findByMissingTeacher()
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
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

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  delete(@Param('id') id: number): Promise<void> {
    return this.contractsService.deleteContract(id)
  }
}
