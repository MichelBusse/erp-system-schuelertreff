import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import * as argon2 from 'argon2'
import dayjs from 'dayjs'
import { DataSource, Not, Repository } from 'typeorm'

import { AuthService } from 'src/auth/auth.service'
import { Contract } from 'src/contracts/contract.entity'
import {
  DocumentsService,
  renderTemplate,
} from 'src/documents/documents.service'
import { LessonsService } from 'src/lessons/lessons.service'

import { CreateAdminDto } from './dto/create-admin.dto'
import { CreateClassCustomerDto } from './dto/create-classCustomer.dto'
import { CreatePrivateCustomerDto } from './dto/create-privateCustomer.dto'
import { CreateSchoolDto } from './dto/create-school.dto'
import { CreateTeacherDto } from './dto/create-teacher.dto'
import { LeaveDto } from './dto/leave.dto'
import { timeAvailable } from './dto/timeAvailable'
import { UpdateClassCustomerDto } from './dto/update-classCustomer.dto'
import { UpdatePrivateCustomerDto } from './dto/update-privateCustomer.dto'
import { UpdateSchoolDto } from './dto/update-school.dto'
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
import { Leave, LeaveState } from './entities/leave.entity'
import { TeacherState } from './entities/teacher.entity'
import { DeleteState, maxTimeRange } from './entities/user.entity'

const allowedStateTransitions: Record<TeacherState, TeacherState[]> = {
  created: [TeacherState.CREATED],
  applied: [TeacherState.APPLIED, TeacherState.CONTRACT],
  contract: [TeacherState.CONTRACT, TeacherState.EMPLOYED],
  employed: [TeacherState.EMPLOYED],
}

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
  const regex = /\["?([^",]*)"?, ?"?([^",]*)"?\)/g

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

    @InjectDataSource()
    private connection: DataSource,

    private readonly lessonsService: LessonsService,

    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,

    private readonly documentsService: DocumentsService,
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
   * Detect the file type of a `Buffer`, `Uint8Array`, or `ArrayBuffer`.
   *
   * @returns The detected file type and MIME type, or `undefined` when there is no match.
   **/
  async fileTypeFromBuffer(buffer: Uint8Array | ArrayBuffer) {
    // workaround for a bug in typescript: https://github.com/microsoft/TypeScript/issues/43329#issuecomment-1008361973
    return (
      Function('return import("file-type")')() as Promise<
        typeof import('file-type')
      >
    ).then((f) => f.fileTypeFromBuffer(buffer))
  }

  async createLeave(userId: number, dto: LeaveDto): Promise<Leave> {
    const repo = this.connection.getRepository(Leave)

    const leave = repo.create({
      user: { id: userId },
      type: dto.type,
      startDate: dto.startDate,
      endDate: dto.endDate,
      state: dto.state,
    })

    // cancel lessons of intersecting contracts
    if (dto.state === LeaveState.ACCEPTED) {
      await this.lessonsService.cancelByLeave(leave)
    }

    return repo.save(leave)
  }

  async updateLeave(id: number, userId: number, dto: LeaveDto): Promise<Leave> {
    const repo = this.connection.getRepository(Leave)

    const leave = await repo
      .createQueryBuilder('l')
      .where('l."userId" = :userId', { userId })
      .andWhere('l.id = :id', { id })
      .leftJoin('l.user', 'u')
      .addSelect('u.id')
      .getOneOrFail()

    if (!leave.hasAttachment && typeof dto.attachment !== 'undefined') {
      return repo.save({ ...leave, attachment: dto.attachment })
    }

    // leave cannot be edited after it was accepted/declined
    if (leave.state !== LeaveState.PENDING) throw new BadRequestException()

    const newLeave = {
      ...leave,
      ...dto,
    }

    // cancel lessons of intersecting contracts
    if (dto.state === LeaveState.ACCEPTED) {
      await this.lessonsService.cancelByLeave(newLeave)
    }

    return repo.save(newLeave)
  }

  async deleteLeave(id: number, userId: number) {
    const repo = this.connection.getRepository(Leave)

    return repo
      .createQueryBuilder()
      .delete()
      .from(Leave)
      .where('"userId" = :userId', { userId })
      .andWhere('id = :id', { id })
      .execute()
  }

  async getLeaveAttachment(id: number, userId: number): Promise<Buffer> {
    const q = this.connection
      .createQueryBuilder()
      .from(Leave, 'l')
      .addSelect('l.attachment')
      .where('l.id = :id', { id })
      .andWhere('l."userId" = :userId', { userId })

    const leave = await q.getOne()

    if (leave === null || leave.attachment === null)
      throw new NotFoundException()

    return leave.attachment
  }

  async getLeaves(state: LeaveState): Promise<Leave[]> {
    const q = this.connection
      .createQueryBuilder()
      .select('l')
      .from(Leave, 'l')
      .leftJoin('l.user', 'u')
      .addSelect('u.id')
      .addSelect('u.firstName')
      .addSelect('u.lastName')
      .where('l."userId" IS NOT NULL')
      .andWhere('l."state" = :state', { state })
      .andWhere(`l."endDate" > now() - interval '1 day'`)

    return q.getMany()
  }

  async getIntersectingLeaves(start: string, end: string): Promise<Leave[]> {
    const qb = this.connection.createQueryBuilder()

    qb.select('l')
      .from(Leave, 'l')
      .leftJoin('l.user', 'u')
      .addSelect('u.id')
      .addSelect('u.firstName')
      .addSelect('u.lastName')
      .where('l."userId" IS NOT NULL')
      .andWhere(`l.state = :state`, { state: LeaveState.ACCEPTED })
      .andWhere(`l.startDate < :end::date`, { end })
      .andWhere(`l.endDate > :start::date`, { start })

    return qb.getMany()
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
    return await this.customersRepository
      .find({
        order: { firstName: 'ASC', lastName: 'ASC' },
      })
      .then(transformUsers)
  }

  async findPrivateCustomers(): Promise<PrivateCustomer[]> {
    return this.privateCustomersRepository
      .find({
        where: { deleteState: Not(DeleteState.DELETED) },
        order: { firstName: 'ASC', lastName: 'ASC' },
      })
      .then(transformUsers)
  }

  async findClassCustomers(): Promise<ClassCustomer[]> {
    return this.classCustomersRepository
      .find({
        where: { deleteState: Not(DeleteState.DELETED) },
        order: { className: 'ASC' },
      })
      .then(transformUsers)
  }
  async findSchools(): Promise<School[]> {
    return this.schoolsRepository
      .find({
        where: { deleteState: Not(DeleteState.DELETED) },
        order: { schoolName: 'ASC' },
      })
      .then(transformUsers)
  }

  async findSchoolsWithStartInFuture(): Promise<School[]> {
    const qb = this.schoolsRepository.createQueryBuilder('s')

    qb.select(['s'])
      .where('s.dateOfStart > now()')
      .orderBy('s.dateOfStart', 'ASC')

    console.log(await qb.getMany())

    return qb.getMany()
  }

  async findTeachers(): Promise<Teacher[]> {
    return this.teachersRepository
      .find({
        relations: ['subjects'],
        where: { deleteState: Not(DeleteState.DELETED) },
        order: { firstName: 'ASC', lastName: 'ASC' },
      })
      .then(transformUsers)
  }

  async findDeletedTeachers(): Promise<Teacher[]> {
    return this.teachersRepository
      .find({
        relations: ['subjects'],
        where: { deleteState: DeleteState.DELETED },
        order: { firstName: 'ASC', lastName: 'ASC' },
      })
      .then(transformUsers)
  }

  async findOne(id: number): Promise<User> {
    return this.usersRepository.findOneByOrFail({ id }).then(transformUser)
  }

  async findOneCustomer(id: number): Promise<Customer> {
    return this.customersRepository.findOneByOrFail({ id }).then(transformUser)
  }

  async findOnePrivateCustomer(id: number): Promise<PrivateCustomer> {
    return this.privateCustomersRepository
      .findOneByOrFail({ id })
      .then(transformUser)
  }

  async findOneSchool(id: number): Promise<School> {
    return this.schoolsRepository.findOneByOrFail({ id }).then(transformUser)
  }

  async findOneTeacher(id: number): Promise<Teacher> {
    return this.teachersRepository
      .findOneOrFail({
        where: { id },
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
      .orderBy('c.className', 'ASC')

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

    return this.classCustomersRepository.save(classCustomer).then(transformUser)
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

    return this.privateCustomersRepository
      .save({
        ...user,
        street: dto.street,
        postalCode: dto.postalCode,
        city: dto.city,
        phone: dto.phone,
        grade: dto.grade,
        schoolType: dto.schoolType,
        timesAvailable: formatTimesAvailable(dto.timesAvailable),
      })
      .then(transformUser)
  }

  async updatePrivateCustomerAdmin(
    id: number,
    dto: UpdatePrivateCustomerDto,
  ): Promise<PrivateCustomer> {
    const user = await this.findOne(id)

    return this.privateCustomersRepository
      .save({
        ...user,
        ...dto,
        timesAvailable: formatTimesAvailable(dto.timesAvailable),
      })
      .then(transformUser)
  }

  async updateClassCustomerAdmin(
    id: number,
    dto: UpdateClassCustomerDto,
  ): Promise<ClassCustomer> {
    const user = await this.findOne(id)

    return this.classCustomersRepository
      .save({
        ...user,
        ...dto,
        timesAvailable: formatTimesAvailable(dto.timesAvailable),
      })
      .then(transformUser)
  }

  async updateSchoolAdmin(id: number, dto: UpdateSchoolDto): Promise<School> {
    const school = await this.findOne(id)

    return this.schoolsRepository
      .save({
        ...school,
        ...dto,
        timesAvailable: `{${maxTimeRange}}`,
      })
      .then(transformUser)
  }

  async updateUserAdmin(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id)

    return this.usersRepository
      .save({
        ...user,
        ...dto,
        timesAvailable: formatTimesAvailable(dto.timesAvailable),
      })
      .then(transformUser)
  }

  async updateTeacher(
    id: number,
    dto: Partial<UpdateTeacherDto>,
  ): Promise<Teacher> {
    const user = await this.findOneTeacher(id)

    // reject non-successive state transitions
    if (dto.state && !allowedStateTransitions[user.state].includes(dto.state)) {
      throw new BadRequestException()
    }

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

    // auto-generate documents
    if (
      user.state !== TeacherState.CONTRACT &&
      updatedTeacher.state === TeacherState.CONTRACT
    ) {
      // generate work contract
      const buffer = await renderTemplate(
        'workContract',
        {
          customerInfo: {
            firstName: updatedTeacher.firstName,
            lastName: updatedTeacher.lastName,
            street: updatedTeacher.street,
            zip: updatedTeacher.postalCode,
            city: updatedTeacher.city,
            dateOfBirth: dayjs(updatedTeacher.dateOfBirth).format('DD.MM.YYYY'),
            phone: updatedTeacher.phone,
            email: updatedTeacher.email,
            fee: updatedTeacher.fee.toFixed(2).replace('.', ','),
            dateOfEmploymentStart: dayjs(
              updatedTeacher.dateOfEmploymentStart,
            ).format('DD.MM.YYYY'),
            bankAccountOwner: updatedTeacher.bankAccountOwner,
            bankInstitution: updatedTeacher.bankInstitution,
            iban: updatedTeacher.iban,
            bic: updatedTeacher.bic,
          },
        },
        {
          left: '90px',
          top: '70px',
          right: '90px',
          bottom: '70px',
        },
      )

      await this.documentsService.create({
        fileName: 'Arbeitsvertrag.pdf',
        fileType: 'application/pdf',
        owner: user.id,
        mayRead: true,
        mayDelete: false,
        content: buffer,
      })
    } else if (
      user.state !== TeacherState.EMPLOYED &&
      updatedTeacher.state === TeacherState.EMPLOYED
    ) {
      // generate efs form
      const buffer = await renderTemplate('efsForm', { user: updatedTeacher })

      await this.documentsService.create({
        fileName: 'Antrag für erweitertes FZ.pdf',
        fileType: 'application/pdf',
        owner: user.id,
        mayRead: true,
        mayDelete: false,
        content: buffer,
      })
    }

    if (user.email !== updatedTeacher.email) {
      this.authService.initReset(user)
    }

    return this.teachersRepository.save(updatedTeacher).then(transformUser)
  }

  async unarchiveTeacher(id: number): Promise<Teacher> {
    const teacher = await this.findOneTeacher(id)

    teacher.deleteState = DeleteState.ACTIVE

    return this.teachersRepository.save(teacher).then(transformUser)
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
        this.teachersRepository.update(id, { deleteState: DeleteState.DELETED })
      } else {
        throw new BadRequestException(
          'Teacher cannot be deleted: there are ongoing or future contracts with this teacher',
        )
      }
    } else {
      if ((await this.findOneTeacher(id)).deleteState === DeleteState.ACTIVE) {
        this.teachersRepository.update(id, { deleteState: DeleteState.DELETED })
      } else {
        this.teachersRepository.delete(id)
      }
    }
  }

  async deleteCustomer(id: number) {
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
          deleteState: DeleteState.DELETED,
        })
      } else {
        throw new BadRequestException(
          'Customer cannot be deleted: there are ongoing or future contracts with this customer',
        )
      }
    } else {
      this.customersRepository.delete(id)
    }
  }

  async deleteSchool(id: number) {
    const qb = this.connection.createQueryBuilder()

    const classCustomerQuery = qb
      .select('c')
      .from(ClassCustomer, 'c')
      .leftJoin('c.school', 's')
      .where('s.id = :id', { id: id })

    const classCustomers = await classCustomerQuery.getMany()
    let allowedToRemove = true

    if (classCustomers.length > 0) {
      for (const classCustomer of classCustomers) {
        if (classCustomer.deleteState !== DeleteState.DELETED) {
          allowedToRemove = false
          break
        }
      }

      if (allowedToRemove) {
        this.schoolsRepository.update(id, {
          deleteState: DeleteState.DELETED,
        })
      } else {
        throw new BadRequestException(
          'School cannot be deleted: first delete every class',
        )
      }
    } else {
      this.schoolsRepository.delete(id)
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
    const user = await this.usersRepository.findOneBy({ id })

    user.passwordHash = await this.hash(password)
    user.jwtValidAfter = new Date()

    return this.usersRepository.save(user)
  }
}
