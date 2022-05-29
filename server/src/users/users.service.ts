import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as argon2 from 'argon2'
import { Repository } from 'typeorm'

import { CreateAdminDto } from './dto/create-admin.dto'
import { CreateCustomerDto } from './dto/create-customer.dto'
import { CreateTeacherDto } from './dto/create-teacher.dto'
import { Admin, Customer, Teacher, User } from './entities'
import { TeacherState } from './entities/teacher.entity'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Teacher)
    private readonly teachersRepository: Repository<Teacher>,

    @InjectRepository(Customer)
    private readonly customersRepository: Repository<Customer>,

    @InjectRepository(Admin)
    private readonly adminsRepository: Repository<Admin>,
  ) {}

  /**
   * Generate a salted password hash using argon2id
   */
  private async hash(password: string) {
    return argon2.hash(password, {
      type: argon2.argon2id,
      timeCost: 2,
      memoryCost: 15 * 1024,
      parallelism: 1,
    })
  }

  /**
   * For authentication only!
   * The returned {@link User} includes the hashed password.
   */
  findByEmailAuth(email: string): Promise<User> {
    return this.usersRepository
      .createQueryBuilder('user')
      .where({ email: email })
      .addSelect(['user.passwordHash', 'user.mayAuthenticate'])
      .getOne()
  }

  /**
   * Find methods
   */

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['subjects'],
    })
  }

  async findAllCustomers(): Promise<Customer[]> {
    return this.customersRepository.find()
  }

  async findAllTeachers(): Promise<Teacher[]> {
    return this.teachersRepository.find({
      relations: ['subjects'],
    })
  }

  findOne(id: number): Promise<User> {
    return this.usersRepository.findOne(id)
  }

  findOneCustomer(id: number): Promise<Customer> {
    return this.customersRepository.findOne(id)
  }

  findOneTeacher(id: number): Promise<Teacher> {
    return this.teachersRepository.findOne(id)
  }

  async findAvailableTeachers(subjectId: number): Promise<Teacher[]> {
    return this.teachersRepository
      .createQueryBuilder('t')
      .innerJoin('t.subjects', 'sub', 'sub.id = :subjectId', { subjectId })
      .select(['t.id', 't.lastName', 't.firstName', 't.fee'])
      .getMany()
  }

  /**
   * Removes the {@link User} with the given id
   * @param id
   */
  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id)
  }

  /**
   * Create {@link User} methods
   */

  async createCustomer(dto: CreateCustomerDto): Promise<Customer> {
    const customer = this.customersRepository.create({
      ...dto,
      mayAuthenticate: false,
    })

    return this.customersRepository.save(customer)
  }

  async createTeacher(dto: CreateTeacherDto): Promise<Teacher> {
    const teacher = this.teachersRepository.create({
      ...dto,
      state: TeacherState.APPLIED,
      mayAuthenticate: true,
    })

    return this.teachersRepository.save(teacher)
  }

  async createAdmin(dto: CreateAdminDto): Promise<Admin> {
    const admin = this.adminsRepository.create({
      ...dto,
      mayAuthenticate: true,
    })

    return this.adminsRepository.save(admin)
  }

  /**
   * Password reset
   */
  async setPassword(id: number, password: string): Promise<User> {
    const user = await this.usersRepository.findOne(id)

    user.passwordHash = await this.hash(password)
    user.jwtValidAfter = new Date()

    return this.usersRepository.save(user)
  }
}
