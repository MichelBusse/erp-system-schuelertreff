import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common'

import { Public } from 'src/auth/decorators/public.decorator'

import { CreateSubjectDto } from './dto/create-subject.dto'
import { Subject } from './subject.entity'
import { SubjectsService } from './subjects.service'

@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Public() //TODO: remove public after tests
  @Post()
  create(@Body() createSubjectDto: CreateSubjectDto): Promise<Subject> {
    return this.subjectsService.create(createSubjectDto)
  }

  @Public() //TODO: remove public after tests
  @Get()
  findAll(): Promise<Subject[]> {
    return this.subjectsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Subject> {
    return this.subjectsService.findOne(id)
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.subjectsService.remove(id)
  }
}
