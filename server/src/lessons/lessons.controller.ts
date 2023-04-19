import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Request,
  Res,
} from '@nestjs/common'
import dayjs from 'dayjs'
import { Response } from 'express'

import { Roles } from 'src/auth/decorators/roles.decorator'
import { Role } from 'src/auth/role.enum'
import { Contract } from 'src/contracts/contract.entity'

import { CreateLessonDto } from './dto/create-lesson.dto'
import { Lesson } from './lesson.entity'
import { LessonsService } from './lessons.service'

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get('latestInvoice')
  getLatestInvoice(): Promise<number> {
    return this.lessonsService.getLatestInvoiceNumber()
  }

  @Get('myLessons')
  findMyContracts(
    @Request() req,
    @Query('of') date: string,
  ): Promise<{
    contracts: (Contract & { blocked: boolean })[]
    lessons: Lesson[]
    pendingContracts: Contract[]
  }> {
    return this.lessonsService.findByWeek(dayjs(date), req.user.id)
  }

  @Get('week')
  @Roles(Role.ADMIN, Role.SCHOOL)
  getWeek(@Query('of') date: string) {
    return this.lessonsService.findByWeek(dayjs(date))
  }

  @Get('week/mySchool')
  @Roles(Role.ADMIN, Role.SCHOOL)
  getWeekForSchool(@Query('of') date: string, @Request() req) {
    return this.lessonsService.findByWeekForSchool(dayjs(date), req.user.id)
  }

  @Post('invoice/teacher')
  @Roles(Role.ADMIN)
  async getInvoiceTeacher(
    @Res() res: Response,
    @Body()
    teacherInvoiceData: {
      kilometers: number
      costPerLiter: number
      consumption: number
    },
    @Query('of') month: string,
    @Query('teacherId') teacherId: string,
  ): Promise<void> {
    const buffer = await this.lessonsService.generateInvoiceTeacher({
      invoiceMonth: dayjs(month, 'YYYY-MM-DD'),
      teacherId: Number(teacherId),
      teacherInvoiceData,
    })

    res.set({
      // pdf
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=invoice.pdf',
      'Content-Length': buffer.length,

      // prevent cache
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: 0,
    })

    res.end(buffer)
  }

  @Post('invoice/customer')
  @Roles(Role.ADMIN)
  async getInvoiceCustomer(
    @Res() res: Response,
    @Body()
    invoiceData: {
      invoiceNumber: number
      invoiceType: string
      invoicePreparationTime: number
      invoiceDate: string
    },
    @Query('of') month: string,
    @Query('customerId') customerId: string,
    @Query('schoolId') schoolId: string,
  ): Promise<void> {
    const buffer = await this.lessonsService.generateInvoice({
      invoiceMonth: dayjs(month, 'YYYY-MM-DD'),
      customerId: customerId ? Number(customerId) : null,
      schoolId: schoolId ? Number(schoolId) : null,
      invoiceData,
    })

    res.set({
      // pdf
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=invoice.pdf',
      'Content-Length': buffer.length,

      // prevent cache
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: 0,
    })

    res.end(buffer)
  }

  @Post()
  async updateOrCreate(
    @Request() req,
    @Body() dto: CreateLessonDto,
  ): Promise<Lesson> {
    if (!(await this.lessonsService.validateDate(dto.date, dto.contractId)))
      throw new BadRequestException('Datum ist nicht gültig für diesen Einsatz')

    if (req.user.role === Role.ADMIN) {
      return this.lessonsService.updateOrCreate(dto)
    } else {
      return this.lessonsService.updateOrCreate(dto, req.user.id)
    }
  }

  @Get(':contractId/:date')
  async findOne(
    @Request() req,
    @Param('contractId') id: number,
    @Param('date') date: string,
  ): Promise<{ contract: Contract; lesson: Lesson; blocked: boolean }> {
    if (!(await this.lessonsService.validateDate(date, id)))
      throw new NotFoundException()

    if (req.user.role === Role.ADMIN) {
      return this.lessonsService.findOne(id, date)
    } else {
      return this.lessonsService.findOne(id, date, req.user.id)
    }
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll(): Promise<Lesson[]> {
    return this.lessonsService.findAll()
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: number): Promise<void> {
    return this.lessonsService.remove(id)
  }
}
