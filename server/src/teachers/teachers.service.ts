import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { Teacher, TeacherState } from './teacher.entity';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teachersRepository: Repository<Teacher>,
  ) {}

  create(createTeacherDto: CreateTeacherDto): Promise<Teacher> {
    const teacher = new Teacher();
    teacher.lastName = createTeacherDto.lastName;
    teacher.firstName = createTeacherDto.firstName;
    teacher.salutation = createTeacherDto.salutation;
    teacher.street = createTeacherDto.street;
    teacher.city = createTeacherDto.city;
    teacher.postalCode = createTeacherDto.postalCode;
    teacher.email = createTeacherDto.email;
    teacher.phone = createTeacherDto.phone;
    teacher.fee = createTeacherDto.fee;
    teacher.state = TeacherState.APPLIED;
    teacher.subjects = createTeacherDto.subjects;

    return this.teachersRepository.save(teacher);
  }

  async findAll(): Promise<Teacher[]> {
    return this.teachersRepository.find({
      relations: ['subjects'],
    });
  }

  findOne(id: string): Promise<Teacher> {
    return this.teachersRepository.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.teachersRepository.delete(id);
  }
}
