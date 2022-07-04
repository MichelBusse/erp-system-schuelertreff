import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectConnection, InjectRepository } from '@nestjs/typeorm'
import * as argon2 from 'argon2'
import dayjs from 'dayjs'
import { Connection, Not, Repository } from 'typeorm'

import { Contract } from 'src/contracts/contract.entity'

import { CreateAdminDto } from './dto/create-admin.dto'
import { CreateClassCustomerDto } from './dto/create-classCustomer.dto'
import { CreatePrivateCustomerDto } from './dto/create-privateCustomer.dto'
import { CreateSchoolDto } from './dto/create-school.dto'
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
  School,
  Teacher,
  User,
} from './entities'
import { CustomerState } from './entities/privateCustomer.entity'
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

    @InjectRepository(School)
    private readonly schoolsRepository: Repository<School>,

    @InjectRepository(Admin)
    private readonly adminsRepository: Repository<Admin>,

    @InjectConnection()
    private connection: Connection,
  ) {}

  /**
   * Check if email is already in DB
   */
  async checkDuplicateEmail(email: string): Promise<boolean> {
    return this.usersRepository
      .findOneOrFail({ where: { email: email } })
      .then(() => true)
      .catch(() => false)
  }

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

  async findAppliedPrivateCustomers(): Promise<PrivateCustomer[]> {
    return this.privateCustomersRepository
      .find({ where: { customerState: CustomerState.APPLIED } })
      .then(transformUsers)
  }

  async findAllClassCustomers(): Promise<ClassCustomer[]> {
    return this.classCustomersRepository.find().then(transformUsers)
  }

  async findAllSchools(): Promise<School[]> {
    return this.schoolsRepository.find().then(transformUsers)
  }

  async findAppliedTeachers(): Promise<Teacher[]> {
    return this.teachersRepository
      .find({
        relations: ['subjects'],
        where: { state: Not(TeacherState.DELETED) },
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

  async findOneSchool(id: number): Promise<School> {
    return this.schoolsRepository.findOneOrFail(id).then(transformUser)
  }

  async findOneTeacher(id: number): Promise<Teacher> {
    return this.teachersRepository
      .findOneOrFail(id, {
        relations: ['subjects'],
      })
      .then(transformUser)
  }

  async findAllClassesOfSchool(schoolId?: number): Promise<ClassCustomer[]> {
    const q = this.classCustomersRepository
      .createQueryBuilder('c')
      .leftJoin('c.school', 'school')
      .select([
        'c',
        'school.id',
        'school.street',
        'school.city',
        'school.postalCode',
        'school.schoolName',
        'school.schoolTypes',
      ])
      // .loadAllRelationIds({
      //   relations: ['teacher'],
      // })
      .where('c.schoolId = :schoolId', {
        schoolId: schoolId,
      })

    return q.getMany().then(transformUsers)
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
      school: { id: dto.school },
    })

    return this.classCustomersRepository.save(classCustomer)
  }

  async createSchool(dto: CreateSchoolDto): Promise<School> {
    const school = this.schoolsRepository.create({
      ...dto,
      mayAuthenticate: false,
    })

    return this.schoolsRepository.save(school)
  }

  async createTeacher(dto: CreateTeacherDto): Promise<Teacher> {
    const teacher = this.teachersRepository.create({
      ...dto,
      state: TeacherState.CREATED,
      mayAuthenticate: true,
    })

    return this.teachersRepository.save(teacher)
  }

  async updatePrivateCustomer(
    id: number,
    dto: UpdatePrivateCustomerDto,
  ): Promise<PrivateCustomer> {
    const user = await this.findOne(id)

    return this.privateCustomersRepository.save({
      ...user,
      street: dto.street,
      postalCode: dto.postalCode,
      city: dto.city,
      phone: dto.phone,
      grade: dto.grade,
      timesAvailable: formatTimesAvailable(dto.timesAvailable),
    })
  }

  async updatePrivateCustomerAdmin(
    id: number,
    dto: UpdatePrivateCustomerDto,
  ): Promise<PrivateCustomer> {
    const user = await this.findOne(id)

    return this.privateCustomersRepository.save({
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

  async updateTeacher(
    id: number,
    dto: Partial<UpdateTeacherDto>,
  ): Promise<Teacher> {
    const user = await this.findOneTeacher(id)

    const updatedTeacher: Teacher = {
      ...user,
      ...dto,
      timesAvailable:
        typeof dto.timesAvailable !== 'undefined'
          ? formatTimesAvailable(dto.timesAvailable)
          : user.timesAvailable,
    }

    // check if state can be updated
    if (
      updatedTeacher.state === TeacherState.CREATED &&
      updatedTeacher.street &&
      updatedTeacher.city &&
      updatedTeacher.postalCode &&
      updatedTeacher.phone
    ) {
      updatedTeacher.state = TeacherState.APPLIED
    }

    return this.teachersRepository.save(updatedTeacher)
  }

  async deleteTeacher(id: number) {
    const qb = this.connection.createQueryBuilder()

    const contractQuery = qb
      .select('c.id')
      .addSelect('c.endDate')
      .from(Contract, 'c')
      .where('c.teacherId = :id', { id: id })

    const teachersContracs = await contractQuery.getMany()

    let allowedToRemove = true

    if (teachersContracs.length > 0) {
      for (const contract of teachersContracs) {
        if (!contract.endDate || dayjs(contract.endDate).isAfter(dayjs())) {
          allowedToRemove = false
          break
        }
      }
      if (allowedToRemove) {
        this.teachersRepository.update(id, { state: TeacherState.DELETED })
      } else {
        throw new BadRequestException(
          'Teacher cannot be deleted: there are ongoing or future contracts with this teacher',
        )
      }
    } else {
      this.teachersRepository.delete(id)
    }
  }

  async deletePrivateCustomer(id: number) {
    const qb = this.connection.createQueryBuilder()

    const contractQuery = qb
      .select('c.id')
      .addSelect('c.endDate')
      .from(Contract, 'c')
      .leftJoin('c.customers', 'customer')
      .where('customer.id = :id', { id: id })

    const customersContracs = await contractQuery.getMany()

    let allowedToRemove = true

    if (customersContracs.length > 0) {
      for (const contract of customersContracs) {
        if (!contract.endDate || dayjs(contract.endDate).isAfter(dayjs())) {
          allowedToRemove = false
          break
        }
      }
      if (allowedToRemove) {
        this.privateCustomersRepository.update(id, {
          customerState: CustomerState.DELETED,
        })
      } else {
        throw new BadRequestException(
          'Customer cannot be deleted: there are ongoing or future contracts with this customer',
        )
      }
    } else {
      this.privateCustomersRepository.delete(id)
    }
  }

  /* SELECT c.id from Contract as c LEFT JOIN Teacher as t WHERE t.id =*/

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
