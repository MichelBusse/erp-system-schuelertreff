import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common'

import { Roles } from 'src/auth/decorators/roles.decorator'
import { Role } from 'src/auth/role.enum'

import { SubjectDto } from './dto/subject.dto'
import { Subject } from './subject.entity'
import { SubjectsService } from './subjects.service'

@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Roles(Role.ADMIN)
  @Post(':id')
  update(
    @Param('id') id: number,
    @Body() updateSubjectDto: SubjectDto,
  ): Promise<Subject> {
    return this.subjectsService.update(id, updateSubjectDto)
  }

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() createSubjectDto: SubjectDto): Promise<Subject> {
    return this.subjectsService.create(createSubjectDto)
  }

  @Get()
  findAll(): Promise<Subject[]> {
    return this.subjectsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Subject> {
    return this.subjectsService.findOne(id)
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.subjectsService.remove(id)
  }
}
