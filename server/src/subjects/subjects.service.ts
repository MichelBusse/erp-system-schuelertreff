import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'

import { Contract } from 'src/contracts/contract.entity'
import { Teacher } from 'src/users/entities'

import { SubjectDto } from './dto/subject.dto'
import { Subject } from './subject.entity'

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectsRepository: Repository<Subject>,
    @InjectDataSource()
    private connection: DataSource,
  ) {}

  create(createUserDto: SubjectDto): Promise<Subject> {
    const subject = new Subject()
    subject.name = createUserDto.name
    subject.color = createUserDto.color
    subject.shortForm = createUserDto.shortForm

    return this.subjectsRepository.save(subject)
  }

  async update(id: number, createUserDto: SubjectDto): Promise<Subject> {
    const subject = await this.subjectsRepository.findOneByOrFail({ id })

    subject.name = createUserDto.name
    subject.color = createUserDto.color
    subject.shortForm = createUserDto.shortForm

    return this.subjectsRepository.save(subject)
  }

  async findAll(): Promise<Subject[]> {
    return this.subjectsRepository.find()
  }

  findOne(id: number): Promise<Subject> {
    return this.subjectsRepository.findOneBy({ id })
  }

  async remove(id: number): Promise<void> {
    const qb = this.connection.createQueryBuilder()

    const contractQuery = qb
      .select('c.id')
      .from(Contract, 'c')
      .where('c.subject = :id', { id: id })

    const contracts = await contractQuery.getMany()

    const qb2 = this.connection.createQueryBuilder()

    const teacherQuery = qb2
      .select('t.id')
      .from(Teacher, 't')
      .leftJoin('t.subjects', 'subjects')
      .where('subjects.id = :id', { id: id })

    const teachers = await teacherQuery.getMany()

    if (teachers.length > 0 || contracts.length > 0) {
      throw new BadRequestException(
        'Subject cannot be deleted: the subject is already used by teachers or in contracts',
      )
    } else {
      await this.subjectsRepository.delete(id)
    }
  }
}
