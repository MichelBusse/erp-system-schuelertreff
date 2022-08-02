import {
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

  @Get()
  @Roles(Role.ADMIN)
  findAll(): Promise<Lesson[]> {
    return this.lessonsService.findAll()
  }

  @Get(':contractId/:date')
  findOne(
    @Request() req,
    @Param('contractId') id: number,
    @Param('date') date: string,
  ): Promise<{ contract: Contract; lesson: Lesson; blocked: boolean }> {
    if (req.user.role === Role.ADMIN) {
      return this.lessonsService.findOne(id, date)
    } else {
      return this.lessonsService.findOne(id, date, req.user.id)
    }
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: number): Promise<void> {
    return this.lessonsService.remove(id)
  }
}
