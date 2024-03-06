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
import { LessonsService } from '../services/lessons.service'
import { Contract } from 'src/features/contracts/entities/Contract.entity'
import { Lesson } from '../entities/lesson.entity'
import UserRole from 'src/core/enums/UserRole.enum'
import { LessonDto } from '../dto/lesson.dto'
import { Roles } from 'src/core/decorators/roles.decorator'

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
  @Roles(UserRole.ADMIN, UserRole.SCHOOL)
  getWeek(@Query('of') date: string) {
    return this.lessonsService.findByWeek(dayjs(date))
  }

  @Get('week/mySchool')
  @Roles(UserRole.ADMIN, UserRole.SCHOOL)
  getWeekForSchool(@Query('of') date: string, @Request() req) {
    return this.lessonsService.findByWeekForSchool(dayjs(date), req.user.id)
  }

  @Post('invoice/teacher')
  @Roles(UserRole.ADMIN)
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
  @Roles(UserRole.ADMIN)
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
    @Body() dto: LessonDto,
  ): Promise<Lesson> {
    if (!(await this.lessonsService.validateDate(dto.date, dto.contractId)))
      throw new BadRequestException('Datum ist nicht gültig für diesen Einsatz')

    if (req.user.role === UserRole.ADMIN) {
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

    if (req.user.role === UserRole.ADMIN) {
      return this.lessonsService.findOne(id, date)
    } else {
      return this.lessonsService.findOne(id, date, req.user.id)
    }
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll(): Promise<Lesson[]> {
    return this.lessonsService.findAll()
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: number): Promise<void> {
    return this.lessonsService.remove(id)
  }
}
