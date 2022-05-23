import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { CreateLessonDto } from './dto/create-lesson.dto'
import { Lesson } from './lesson.entity'

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonsRepository: Repository<Lesson>,
  ) {}

  create(createLessonDto: CreateLessonDto): Promise<Lesson> {
    const lesson = new Lesson()
    lesson.date = createLessonDto.date
    lesson.state = createLessonDto.state
    lesson.teacher = createLessonDto.teacher //TODO: teacher optional
    lesson.contract = createLessonDto.contract

    return this.lessonsRepository.save(lesson)
  }

  async findAll(): Promise<Lesson[]> {
    return this.lessonsRepository.find({
      loadRelationIds: true,
    })
  }

  findOne(id: string): Promise<Lesson> {
    return this.lessonsRepository.findOne(id)
  }

  async remove(id: string): Promise<void> {
    await this.lessonsRepository.delete(id)
  }
}
