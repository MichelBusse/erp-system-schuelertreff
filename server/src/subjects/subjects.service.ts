import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectConnection, InjectRepository } from '@nestjs/typeorm'
import { Contract } from 'src/contracts/contract.entity'
import { Teacher } from 'src/users/entities'
import { Connection, Repository } from 'typeorm'

import { CreateSubjectDto } from './dto/create-subject.dto'
import { Subject } from './subject.entity'

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectsRepository: Repository<Subject>,
    @InjectConnection()
    private connection: Connection,
  ) {}

  create(createUserDto: CreateSubjectDto): Promise<Subject> {
    const subject = new Subject()
    subject.name = createUserDto.name
    subject.color = createUserDto.color
    subject.shortForm = createUserDto.shortForm

    return this.subjectsRepository.save(subject)
  }

  async update(id: number, createUserDto: CreateSubjectDto): Promise<Subject> {
    const subject = await this.subjectsRepository.findOneOrFail(id)

    subject.name = createUserDto.name
    subject.color = createUserDto.color
    subject.shortForm = createUserDto.shortForm

    return this.subjectsRepository.save(subject)
  }

  async findAll(): Promise<Subject[]> {
    return this.subjectsRepository.find()
  }

  findOne(id: number): Promise<Subject> {
    return this.subjectsRepository.findOne(id)
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

    if(teachers.length > 0 || contracts.length > 0){
      throw new BadRequestException(
        'Subject cannot be deleted: the subject is already used by teachers or in contracts',
      )
    }else{
      await this.subjectsRepository.delete(id)
    }
  }
}
