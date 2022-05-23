import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common'

import { CreateSubjectDto } from './dto/create-subject.dto'
import { Subject } from './subject.entity'
import { SubjectsService } from './subjects.service'

@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  create(@Body() createSubjectDto: CreateSubjectDto): Promise<Subject> {
    return this.subjectsService.create(createSubjectDto)
  }

  @Get()
  findAll(): Promise<Subject[]> {
    return this.subjectsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Subject> {
    return this.subjectsService.findOne(id)
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.subjectsService.remove(id)
  }
}
