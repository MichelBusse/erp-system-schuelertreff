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

  @Get('myLessons')
  findMyContracts(
    @Request() req,
    @Query('of') date: string,
  ): Promise<{
    contracts: Contract[]
    lessons: Lesson[]
    pendingContracts: Contract[]
  }> {
    return this.lessonsService.findByWeek(dayjs(date), req.user.id)
  }

  @Get('week')
  @Roles(Role.ADMIN)
  getWeek(@Query('of') date: string) {
    return this.lessonsService.findByWeek(dayjs(date))
  }

  @Get('invoice/teacher')
  async getInvoiceTeacher(
    @Request() req,
    @Res() res: Response,
    @Query('of') month: string,
    @Query('teacherId') teacherId: string,
  ): Promise<void> {
    if (req.user.id === teacherId || req.user.role === Role.ADMIN) {
      const buffer = await this.lessonsService.generateInvoiceTeacher({
        invoiceMonth: dayjs(month, 'YYYY-MM-DD'),
        teacherId: Number(teacherId),
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
    }else{
      throw new BadRequestException("You don't have permission to generate the invoice of this teacher")
    }
  }

  @Get('invoice/customer')
  @Roles(Role.ADMIN)
  async getInvoiceCustomer(
    @Res() res: Response,
    @Query('of') month: string,
    @Query('customerId') customerId: string,
    @Query('schoolId') schoolId: string,
  ): Promise<void> {
    const buffer = await this.lessonsService.generateInvoice({
      invoiceMonth: dayjs(month, 'YYYY-MM-DD'),
      customerId: customerId ? Number(customerId) : null,
      schoolId: schoolId ? Number(schoolId) : null,
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

  @Post('')
  create(
    @Request() req,
    @Body() createLessonDto: CreateLessonDto,
  ): Promise<Lesson> {
    if (req.user.role === Role.ADMIN) {
      return this.lessonsService.create(createLessonDto)
    } else {
      return this.lessonsService.create(createLessonDto, req.user.id)
    }
  }

  @Post(':id')
  update(
    @Param('id') id: number,
    @Request() req,
    @Body() createLessonDto: CreateLessonDto,
  ): Promise<Lesson> {
    if (req.user.role === Role.ADMIN) {
      return this.lessonsService.update(id, createLessonDto)
    } else {
      return this.lessonsService.update(id, createLessonDto, req.user.id)
    }
  }

  @Get(':contractId/:date')
  findOne(
    @Request() req,
    @Param('contractId') id: number,
    @Param('date') date: string,
  ): Promise<{lesson: Lesson, contract: Contract}> {
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
