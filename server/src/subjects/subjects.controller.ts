import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common'

import { Roles } from 'src/auth/decorators/roles.decorator'
import { Role } from 'src/auth/role.enum'

import { CreateSubjectDto } from './dto/create-subject.dto'
import { Subject } from './subject.entity'
import { SubjectsService } from './subjects.service'

@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() createSubjectDto: CreateSubjectDto): Promise<Subject> {
    return this.subjectsService.create(createSubjectDto)
  }

  @Roles(Role.ADMIN)
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
