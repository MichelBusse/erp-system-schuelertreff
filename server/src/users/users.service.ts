import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as argon2 from 'argon2'
import dayjs from 'dayjs'
import { Repository } from 'typeorm'

import { CreateAdminDto } from './dto/create-admin.dto'
import { CreateClassCustomerDto } from './dto/create-classCustomer.dto'
import { CreatePrivateCustomerDto } from './dto/create-privateCustomer.dto'
import { CreateSchoolCustomerDto } from './dto/create-schoolCustomer.dto'
import { CreateTeacherDto } from './dto/create-teacher.dto'
import { timeAvailable } from './dto/timeAvailable'
import { UpdatePrivateCustomerDto } from './dto/update-privateCustomer.dto'
import { UpdateTeacherDto } from './dto/update-teacher.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import {
  Admin,
  ClassCustomer,
  Customer,
  PrivateCustomer,
  SchoolCustomer,
  Teacher,
  User,
} from './entities'

import { TeacherState } from './entities/teacher.entity'
import { maxTimeRange } from './entities/user.entity'

/**
 * Format Array of {@link timeAvailable} as Postgres `tstzmultirange`
 */
export function formatTimesAvailable(times: timeAvailable[]) {
  if (times.length === 0) return `{${maxTimeRange}}`

  return `{${times
    .map((t) => {
      const date = dayjs('2001-01-01').day(t.dow).format('YYYY-MM-DD')
      return `[${date} ${t.start}, ${date} ${t.end})` // exclusive upper bound
    })
    .join(', ')}}`
}

/**
 * Parse Postgres `tstzmultirange` literal to Array of {@link timeAvailable}
 */
export function parseMultirange(multirange: string): timeAvailable[] {
  const regex = /[\[\(]"([^"]*)","([^"]*)"[\]\)]/g

  return [...multirange.matchAll(regex)].map((range) => {
    const start = dayjs(range[1].substring(0, 16))
    const end = dayjs(range[2].substring(0, 16))

    return {
      start: start.format('HH:mm'),
      end: end.day() > start.day() ? '24:00' : end.format('HH:mm'),
      dow: start.day(),
    }
  })
}

function transformUser<U extends User>(
  user: U,
): U & { timesAvailableParsed: timeAvailable[] } {
  return {
    ...user,
    timesAvailableParsed: parseMultirange(user.timesAvailable),
  }
}

function transformUsers<U extends User>(users: U[]) {
  return users.map(transformUser)
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Teacher)
    private readonly teachersRepository: Repository<Teacher>,

    @InjectRepository(Customer)
    private readonly customersRepository: Repository<Customer>,

    @InjectRepository(PrivateCustomer)
    private readonly privateCustomersRepository: Repository<PrivateCustomer>,

    @InjectRepository(ClassCustomer)
    private readonly classCustomersRepository: Repository<ClassCustomer>,

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
    return this.usersRepository
      .find({
        relations: ['subjects'],
      })
      .then(transformUsers)
  }

  async findAllCustomers(): Promise<Customer[]> {
    return this.customersRepository.find().then(transformUsers)
  }

  async findAllPrivateCustomers(): Promise<PrivateCustomer[]> {
    return this.privateCustomersRepository.find().then(transformUsers)
  }

  async findAllClassCustomers(): Promise<ClassCustomer[]> {
    return this.classCustomersRepository.find().then(transformUsers)
  }

  async findAllSchoolCustomers(): Promise<SchoolCustomer[]> {
    return this.schoolCustomersRepository.find().then(transformUsers)
  }

  async findAllTeachers(): Promise<Teacher[]> {
    return this.teachersRepository
      .find({
        relations: ['subjects'],
      })
      .then(transformUsers)
  }

  async findOne(id: number): Promise<User> {
    return this.usersRepository.findOneOrFail(id).then(transformUser)
  }

  async findOneCustomer(id: number): Promise<Customer> {
    return this.customersRepository.findOneOrFail(id).then(transformUser)
  }

  async findOnePrivateCustomer(id: number): Promise<PrivateCustomer> {
    return this.privateCustomersRepository.findOneOrFail(id).then(transformUser)
  }

  async findOneSchoolCustomer(id: number): Promise<SchoolCustomer> {
    return this.schoolCustomersRepository.findOneOrFail(id).then(transformUser)
  }
  
  async findOneTeacher(id: number): Promise<Teacher> {
    return this.teachersRepository
      .findOneOrFail(id, {
        relations: ['subjects'],
      })
      .then(transformUser)
  }

  async findAllClassesOfSchool(schoolCustomerId?: number): Promise<ClassCustomer[]> {
    const q = this.classCustomersRepository
      .createQueryBuilder('c')
      .leftJoin('c.schoolCustomer', 'schoolCustomer')
      .select([
        'c',
        'schoolCustomer.id',
        'schoolCustomer.street',
        'schoolCustomer.city',
        'schoolCustomer.postalCode',
        'schoolCustomer.schoolName',
        'schoolCustomer.schoolTypes',
      ])
      // .loadAllRelationIds({
      //   relations: ['teacher'],
      // })
      .where(
        'c.schoolCustomerId = :schoolCustomerId',
        { schoolCustomerId: schoolCustomerId },
      )

    return q.getMany()
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

  async createPrivateCustomer(
    dto: CreatePrivateCustomerDto,
  ): Promise<PrivateCustomer> {
    const privateCustomer = this.privateCustomersRepository.create({
      ...dto,
      timesAvailable: formatTimesAvailable(dto.timesAvailable),
      mayAuthenticate: false,
    })

    return this.privateCustomersRepository.save(privateCustomer)
  }

  async createClassCustomer(
    dto: CreateClassCustomerDto,
  ): Promise<ClassCustomer> {
    const classCustomer = this.classCustomersRepository.create({
      ...dto,
      timesAvailable: formatTimesAvailable(dto.timesAvailable),
      mayAuthenticate: false,
      street: null,
      city: null,
      postalCode: null,
      email: null,
      phone: null,
      schoolCustomer: { id: dto.schoolCustomer },
    })

    return this.classCustomersRepository.save(classCustomer)
  }

  async createSchoolCustomer(
    dto: CreateSchoolCustomerDto,
  ): Promise<SchoolCustomer> {
    const schoolCustomer = this.schoolCustomersRepository.create({
      ...dto,
      mayAuthenticate: false,
    })

    return this.schoolCustomersRepository.save(schoolCustomer)
  }

  async createTeacher(dto: CreateTeacherDto): Promise<Teacher> {
    const teacher = this.teachersRepository.create({
      ...dto,
      timesAvailable: formatTimesAvailable(dto.timesAvailable),
      state: TeacherState.APPLIED,
      mayAuthenticate: true,
    })

    return this.teachersRepository.save(teacher)
  }


  async updatePrivateCustomer(id: number, dto: UpdatePrivateCustomerDto): Promise<User> {
    const user = await this.findOne(id)

    return this.usersRepository.save({
      ...user,
      street: dto.street,
      postalCode: dto.postalCode,
      city: dto.city,
      phone: dto.phone,
      grade: dto.grade,
      timesAvailable: formatTimesAvailable(dto.timesAvailable),
    })
  }

  async updatePrivateCustomerAdmin(id: number, dto: UpdatePrivateCustomerDto): Promise<User> {
    const user = await this.findOne(id)

    return this.usersRepository.save({
      ...user,
      ...dto,
      timesAvailable: formatTimesAvailable(dto.timesAvailable),
    })
  }
  
  async updateUserAdmin(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id)

    return this.usersRepository.save({
      ...user,
      ...dto,
      timesAvailable: formatTimesAvailable(dto.timesAvailable),
    })
  }

  async updateTeacher(id: number, dto: UpdateTeacherDto): Promise<User> {
    const user = await this.findOne(id)
    return this.usersRepository.save({
      ...user,
      street: dto.street,
      postalCode: dto.postalCode,
      subjects: dto.subjects,
      email: dto.email,
      phone: dto.phone,
      city: dto.city,
      schoolTypes: dto.schoolTypes,
      timesAvailable: formatTimesAvailable(dto.timesAvailable),
    })
  }

  async updateTeacherAdmin(id: number, dto: UpdateTeacherDto): Promise<User> {
    const user = await this.findOne(id)
    return this.usersRepository.save({
      ...user,
      ...dto,
      timesAvailable: formatTimesAvailable(dto.timesAvailable),
    })
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
