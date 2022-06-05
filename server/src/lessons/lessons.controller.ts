import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common'
import dayjs from 'dayjs'

import { Public } from 'src/auth/decorators/public.decorator'

import { CreateLessonDto } from './dto/create-lesson.dto'
import { Lesson } from './lesson.entity'
import { LessonsService } from './lessons.service'

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Public()
  @Get('week')
  getWeek(@Query('of') date: string) {
    return this.lessonsService.findByWeek(dayjs(date))
  }

  @Post()
  create(@Body() createLessonDto: CreateLessonDto): Promise<Lesson> {
    return this.lessonsService.create(createLessonDto)
  }

  @Get()
  findAll(): Promise<Lesson[]> {
    return this.lessonsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Lesson> {
    return this.lessonsService.findOne(id)
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.lessonsService.remove(id)
  }
}
