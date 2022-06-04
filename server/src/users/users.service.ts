import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as argon2 from 'argon2'
import { Repository } from 'typeorm'

import { CreateAdminDto } from './dto/create-admin.dto'
import { CreateSchoolCustomerDto } from './dto/create-schoolCustomer.dto'
import { CreatePrivateCustomerDto } from './dto/create-privateCustomer.dto'
import { CreateTeacherDto } from './dto/create-teacher.dto'
import { Admin, PrivateCustomer, SchoolCustomer, Teacher, User } from './entities'
import { TeacherState } from './entities/teacher.entity'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Teacher)
    private readonly teachersRepository: Repository<Teacher>,

    @InjectRepository(PrivateCustomer)
    private readonly privateCustomersRepository: Repository<PrivateCustomer>,

    @InjectRepository(SchoolCustomer)
    private readonly schoolCustomersRepository: Repository<SchoolCustomer>,

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

  async findAllPrivateCustomers(): Promise<PrivateCustomer[]> {
    return this.privateCustomersRepository.find()
  }

  async findAllSchoolCustomers(): Promise<SchoolCustomer[]> {
    return this.schoolCustomersRepository.find()
  }

  async findAllTeachers(): Promise<Teacher[]> {
    return this.teachersRepository.find({
      relations: ['subjects'],
    })
  }

  findOne(id: number): Promise<User> {
    return this.usersRepository.findOne(id)
  }

  findOnePrivateCustomer(id: number): Promise<PrivateCustomer> {
    return this.privateCustomersRepository.findOne(id)
  }

  findOneSchoolCustomer(id: number): Promise<SchoolCustomer> {
    return this.schoolCustomersRepository.findOne(id)
  }

  findOneTeacher(id: number): Promise<Teacher> {
    return this.teachersRepository.findOne(id)
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

  async createPrivateCustomer(dto: CreatePrivateCustomerDto): Promise<PrivateCustomer> {
    const privateCustomer = this.privateCustomersRepository.create({
      lastName: dto.lastName,
      firstName: dto.firstName,
      salutation: dto.salutation,
      street: dto.street,
      city: dto.city,
      postalCode: dto.postalCode,
      email: dto.email,
      phone: dto.phone,
      mayAuthenticate: false,
    })

    return this.privateCustomersRepository.save(privateCustomer)
  }

  async createSchoolCustomer(dto: CreateSchoolCustomerDto): Promise<SchoolCustomer> {
    const schoolCustomer = this.schoolCustomersRepository.create({
      schoolName: dto.schoolName,
      street: dto.street,
      city: dto.city,
      postalCode: dto.postalCode,
      email: dto.email,
      phone: dto.phone,
      mayAuthenticate: false,
    })

    return this.schoolCustomersRepository.save(schoolCustomer)
  }

  async createTeacher(dto: CreateTeacherDto): Promise<Teacher> {
    const teacher = this.teachersRepository.create({
      lastName: dto.lastName,
      firstName: dto.firstName,
      salutation: dto.salutation,
      street: dto.street,
      city: dto.city,
      postalCode: dto.postalCode,
      email: dto.email,
      phone: dto.phone,
      fee: dto.fee,
      state: TeacherState.APPLIED,
      subjects: dto.subjects,
      mayAuthenticate: true,
    })

    return this.teachersRepository.save(teacher)
  }

  async createAdmin(dto: CreateAdminDto): Promise<Admin> {
    const admin = this.adminsRepository.create({
      lastName: dto.lastName,
      firstName: dto.firstName,
      salutation: dto.salutation,
      street: dto.street,
      city: dto.city,
      postalCode: dto.postalCode,
      email: dto.email,
      phone: dto.phone,
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
