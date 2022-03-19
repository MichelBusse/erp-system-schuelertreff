import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { Teacher } from './teacher.entity';
import { TeachersService } from './teachers.service';

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  create(@Body() createTeacherDto: CreateTeacherDto): Promise<Teacher> {
    return this.teachersService.create(createTeacherDto);
  }

  @Get()
  findAll(): Promise<Teacher[]> {
    return this.teachersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Teacher> {
    return this.teachersService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.teachersService.remove(id);
  }
}
