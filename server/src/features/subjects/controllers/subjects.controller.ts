import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common'
import { SubjectsService } from '../services/subjects.service'
import { SubjectDto } from '../dto/subject.dto'
import { Subject } from '../entities/subject.entity'
import UserRole from 'src/core/enums/UserRole.enum'
import { Roles } from 'src/core/decorators/roles.decorator'

@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Roles(UserRole.ADMIN)
  @Post(':id')
  update(
    @Param('id') id: number,
    @Body() updateSubjectDto: SubjectDto,
  ): Promise<Subject> {
    return this.subjectsService.update(id, updateSubjectDto)
  }

  @Roles(UserRole.ADMIN)
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

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.subjectsService.remove(id)
  }
}
