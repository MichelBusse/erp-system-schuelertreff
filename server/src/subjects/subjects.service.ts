import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { Subject } from './subject.entity';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectsRepository: Repository<Subject>,
  ) {}

  create(createUserDto: CreateSubjectDto): Promise<Subject> {
    const subject = new Subject();
    subject.name = createUserDto.name;
    subject.color = createUserDto.color;
    subject.shortForm = createUserDto.shortForm;

    return this.subjectsRepository.save(subject);
  }

  async findAll(): Promise<Subject[]> {
    return this.subjectsRepository.find();
  }

  findOne(id: string): Promise<Subject> {
    return this.subjectsRepository.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.subjectsRepository.delete(id);
  }
}
