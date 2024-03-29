import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import * as argon2 from 'argon2'
import dayjs from 'dayjs'
import nodemailer from 'nodemailer'
import { DataSource, Not, Repository } from 'typeorm'
import {
  applicationMeetingProposalMail,
  applicationMeetingSetDateMail,
  employmentMail,
} from 'src/core/res/mailTexts'
import TeacherState from 'src/core/enums/TeacherState.enum'
import { User } from '../entities/user.entity'
import { Teacher } from '../entities/teacher.entity'
import { Customer } from '../entities/customer.entity'
import { PrivateCustomer } from '../entities/privateCustomer.entity'
import { ClassCustomer } from '../entities/classCustomer.entity'
import { School } from '../entities/school.entity'
import { Admin } from '../entities/Admin.entity'
import { LessonsService } from 'src/features/lessons/services/lessons.service'
import { UserDocumentsService } from 'src/features/user-documents/services/user-documents.service'
import UserDeleteState from 'src/core/enums/UserDeleteState.enum'
import { LeaveDto } from '../dto/leave.dto'
import LeaveState from 'src/core/enums/LeaveState.enum'
import { UpdateUserDto } from '../dto/update-user.dto'
import { CreateAdminDto } from '../dto/create-admin.dto'
import { CreateTeacherDto } from '../dto/create-teacher.dto'
import { UserDocument } from 'src/features/user-documents/entities/UserDocument.entity'
import { UpdateTeacherDto } from '../dto/update-teacher.dto'
import { RequestApplicationMeetingDto } from '../dto/request-application-meeting.dto'
import { Contract } from 'src/features/contracts/entities/Contract.entity'
import UserRole from 'src/core/enums/UserRole.enum'
import { CreatePrivateCustomerDto } from '../dto/create-privateCustomer.dto'
import { UpdatePrivateCustomerDto } from '../dto/update-privateCustomer.dto'
import { CreateSchoolDto } from '../dto/create-school.dto'
import { UpdateSchoolDto } from '../dto/update-school.dto'
import SchoolState from 'src/core/enums/SchoolState.enum'
import { CreateClassCustomerDto } from '../dto/create-classCustomer.dto'
import { UpdateClassCustomerDto } from '../dto/update-classCustomer.dto'
import { AuthService } from 'src/features/auth/services/auth.service'
import { Leave } from '../entities/Leave'
import { transformUser, transformUsers } from 'src/core/utils/TransformUsers'
import { parseTSTZMultirange } from 'src/core/utils/TimeSlotUtils'
import { ALLOWED_TEACHER_STATE_TRANSITIONS, MAX_TIME_RANGE } from 'src/core/res/Constants'
import { renderDocumentFromTemplate } from 'src/core/utils/RenderDocument'

require('dayjs/locale/de')

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

    private readonly documentsService: UserDocumentsService,

    private config: ConfigService,
  ) {}

  private transport = nodemailer.createTransport(
    {
      host: this.config.get<string>('SMTP_HOST'),
      port: this.config.get<number>('SMTP_PORT'),
    },
    {
      from: this.config.get<string>('EMAIL_NOREPLY'),
    },
  )

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
      .where({ email: email.trim().toLowerCase() })
      .andWhere({ deleteState: UserDeleteState.ACTIVE })
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

  async getApplicationMeetings(
    start: string,
    end: string,
  ): Promise<Partial<Teacher>[]> {
    const qb = this.teachersRepository
      .createQueryBuilder('t')
      .select([
        `t."id"`,
        `t."firstName"`,
        `t."lastName"`,
        `t."dateOfApplicationMeeting"`,
      ])
      .where(`t."dateOfApplicationMeeting"::date >= :start::date`, { start })
      .andWhere(`t."dateOfApplicationMeeting"::date <= :end::date`, { end })
      // .andWhere(`t."deleteState" = :active`, { active: DeleteState.ACTIVE })
      .orderBy(`t."dateOfApplicationMeeting"`)

    return qb.getRawMany()
  }

  /**
   *
   * User functions
   *
   **/

  async findAll(): Promise<User[]> {
    return this.usersRepository
      .find({
        relations: ['subjects'],
      })
      .then(transformUsers)
  }

  async findOne(id: number): Promise<User> {
    return this.usersRepository.findOneByOrFail({ id }).then(transformUser)
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id)
  }

  async updateUserAdmin(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id)

    return this.usersRepository
      .save({
        ...user,
        ...dto,
        timesAvailable: parseTSTZMultirange(dto.timesAvailable),
      })
      .then(transformUser)
  }

  async updateUserMayAuthenticate(
    id: number,
    mayAuthenticate: boolean,
  ): Promise<User> {
    const user = await this.findOne(id)

    return this.usersRepository.save({
      ...user,
      mayAuthenticate: mayAuthenticate,
    })
  }

  async createAdmin(dto: CreateAdminDto): Promise<Admin> {
    const admin = this.adminsRepository.create({
      ...dto,
      mayAuthenticate: true,
    })

    return this.adminsRepository.save(admin)
  }

  async unarchiveUser(id: number) {
    const user = await this.findOne(id)
    user.deleteState = UserDeleteState.ACTIVE

    this.usersRepository.save(user)
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

  /**
   *
   * Teacher functions
   *
   **/
  async findTeachers(): Promise<Teacher[]> {
    return this.teachersRepository
      .find({
        relations: ['subjects'],
        where: { deleteState: Not(UserDeleteState.DELETED) },
        order: { firstName: 'ASC', lastName: 'ASC' },
      })
      .then(transformUsers)
  }

  async findAppliedTeachers(): Promise<Teacher[]> {
    return this.teachersRepository
      .find({
        relations: ['subjects'],
        where: {
          deleteState: Not(UserDeleteState.DELETED),
          state: Not(TeacherState.EMPLOYED),
        },
        order: { firstName: 'ASC', lastName: 'ASC' },
      })
      .then(transformUsers)
  }

  async findEmployedTeachers(): Promise<Teacher[]> {
    return this.teachersRepository
      .find({
        relations: ['subjects'],
        where: {
          deleteState: Not(UserDeleteState.DELETED),
          state: TeacherState.EMPLOYED,
        },
        order: { firstName: 'ASC', lastName: 'ASC' },
      })
      .then(transformUsers)
  }

  async findEmployedDeletedTeachers(): Promise<Teacher[]> {
    return this.teachersRepository
      .find({
        relations: ['subjects'],
        where: {
          deleteState: UserDeleteState.DELETED,
          state: TeacherState.EMPLOYED,
        },
        order: { firstName: 'ASC', lastName: 'ASC' },
      })
      .then(transformUsers)
  }

  async findAppliedDeletedTeachers(): Promise<Teacher[]> {
    return this.teachersRepository
      .find({
        relations: ['subjects'],
        where: {
          deleteState: UserDeleteState.DELETED,
          state: Not(TeacherState.EMPLOYED),
        },
        order: { firstName: 'ASC', lastName: 'ASC' },
      })
      .then(transformUsers)
  }

  async findOneTeacher(id: number): Promise<Teacher> {
    return this.teachersRepository
      .findOneOrFail({
        where: { id },
        relations: ['subjects'],
      })
      .then(transformUser)
  }

  async findOneTeacherAsSchool(id: number): Promise<Partial<Teacher>> {
    const teacher = await this.teachersRepository
      .findOneOrFail({
        where: { id },
        relations: ['subjects'],
      })
      .then(transformUser)

    return {
      id: teacher.id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      phone: teacher.phone,
      teacherSchoolTypes: teacher.teacherSchoolTypes,
      degree: teacher.degree,
      subjects: teacher.subjects,
    }
  }

  async createTeacher(dto: CreateTeacherDto): Promise<Teacher> {
    const teacher = this.teachersRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email.toLowerCase(),
      applicationLocation: dto.applicationLocation,
      dateOfApplication: dto.dateOfApplication,
      state: dto.skip ? TeacherState.EMPLOYED : TeacherState.CREATED,
      mayAuthenticate: dto.skip,
    })

    return this.teachersRepository.save(teacher)
  }

  async generateWorkContract(id: number): Promise<UserDocument> {
    const user = await this.findOneTeacher(id)

    // generate work contract
    const buffer = await renderDocumentFromTemplate(
      'workContract',
      {
        customerInfo: {
          firstName: user.firstName,
          lastName: user.lastName,
          street: user.street,
          zip: user.postalCode,
          city: user.city,
          dateOfBirth: dayjs(user.dateOfBirth).format('DD.MM.YYYY'),
          phone: user.phone,
          email: user.email,
          fee: Number(user.fee).toFixed(2).replace('.', ','),
          dateOfEmploymentStart: dayjs(user.dateOfEmploymentStart).format(
            'DD.MM.YYYY',
          ),
          bankAccountOwner: user.bankAccountOwner,
          bankInstitution: user.bankInstitution,
          iban: user.iban,
          bic: user.bic,
        },
      },
      {
        left: '90px',
        top: '70px',
        right: '90px',
        bottom: '70px',
      },
    )

    return this.documentsService.create({
      fileName: 'Arbeitsvertrag.pdf',
      fileType: 'application/pdf',
      owner: user.id,
      visibleToUser: true,
      visibleToEverybody: false,
      mayDelete: false,
      content: buffer,
    })
  }

  async generateEFZ(id: number): Promise<UserDocument> {
    const user = await this.findOneTeacher(id)

    // generate work contract
    const buffer = await renderDocumentFromTemplate(
      'efzForm',
      {
        customerInfo: {
          firstName: user.firstName,
          lastName: user.lastName,
          street: user.street,
          zip: user.postalCode,
          city: user.city,
          dateOfBirth: dayjs(user.dateOfBirth).format('DD.MM.YYYY'),
          phone: user.phone,
          email: user.email,
          fee: Number(user.fee).toFixed(2).replace('.', ','),
          dateOfEmploymentStart: dayjs(user.dateOfEmploymentStart).format(
            'DD.MM.YYYY',
          ),
          bankAccountOwner: user.bankAccountOwner,
          bankInstitution: user.bankInstitution,
          iban: user.iban,
          bic: user.bic,
        },
      },
      {
        left: '90px',
        top: '70px',
        right: '90px',
        bottom: '70px',
      },
    )

    return this.documentsService.create({
      fileName: 'Führungszeugnis Antrag.pdf',
      fileType: 'application/pdf',
      owner: user.id,
      visibleToUser: true,
      visibleToEverybody: false,
      mayDelete: false,
      content: buffer,
    })
  }

  async updateTeacher(
    id: number,
    dto: Partial<UpdateTeacherDto>,
  ): Promise<Teacher> {
    const user = await this.findOneTeacher(id)

    // reject non-successive state transitions
    if (dto.state && !ALLOWED_TEACHER_STATE_TRANSITIONS[user.state].includes(dto.state)) {
      throw new BadRequestException()
    }

    const updatedTeacher: Teacher = {
      ...user,
      ...dto,
      email: dto.email ? dto.email.toLowerCase() : user.email,
      timesAvailable:
        typeof dto.timesAvailable !== 'undefined'
          ? parseTSTZMultirange(dto.timesAvailable)
          : user.timesAvailable,
    }

    if (
      user.state !== TeacherState.CONTRACT &&
      updatedTeacher.state === TeacherState.CONTRACT
    ) {
      updatedTeacher.mayAuthenticate = true
    }

    if (
      user.state === TeacherState.CONTRACT &&
      updatedTeacher.state === TeacherState.EMPLOYED
    ) {
      try {
        this.transport.sendMail(
          {
            replyTo: this.config.get<string>('EMAIL_FROM'),
            to: user.email,
            subject: 'Schülertreff - Willkommen',
            text: employmentMail(
              updatedTeacher.firstName + ' ' + updatedTeacher.lastName,
            ),
          },
          (error) => {
            if (error) console.log(error)
          },
        )
        console.log('Employment-Mail successfully sent to ' + user.email)
      } catch {
        console.log('Failed to send meeting email to ' + user.email)
      }
    }

    if (
      (updatedTeacher.state === TeacherState.CONTRACT ||
        updatedTeacher.state === TeacherState.EMPLOYED) &&
      user.email !== updatedTeacher.email
    ) {
      this.authService.initReset(user)
    }

    return this.teachersRepository.save(updatedTeacher).then(transformUser)
  }

  async sendApplicationMeetingRequest(
    id: number,
    dto: RequestApplicationMeetingDto,
  ): Promise<Teacher> {
    const user = await this.findOneTeacher(id)

    if (user.state !== TeacherState.CREATED)
      throw new BadRequestException(
        'ApplicationMeetingRequest can only be send when in state "created"',
      )

    if (dto.fixedRequest) {
      user.dateOfApplicationMeeting = dto.dates[0]
      // Send ApplicationMeetingRequestMail with fixed date (dto.dates[0])
      try {
        this.transport.sendMail(
          {
            replyTo: this.config.get<string>('EMAIL_FROM_BEWERBUNG'),
            to: user.email,
            subject: 'Schülertreff - Termin Bewerbungsgespräch',
            text: applicationMeetingSetDateMail(
              user.firstName + ' ' + user.lastName,
              'https://us04web.zoom.us/j/73707078960?pwd=aWFFbThlTVIrTzQ5dWZVYlVzYWNqdz09',
              `- ${dayjs(dto.dates[0])
                .locale('de')
                .format('dddd')}, den ${dayjs(dto.dates[0]).format(
                'DD.MM.YYYY',
              )} um ${dayjs(dto.dates[0]).format('HH:mm')} Uhr`,
            ),
          },
          (error) => {
            if (error) console.log(error)
          },
        )
        console.log(
          'Meeting-Confirmation-Mail successfully sent to ' + user.email,
        )
      } catch {
        console.log('Failed to send meeting email to ' + user.email)
      }
    } else {
      // Send alternative ApplicationMeetingRequestMail with proposed dates (dto.dates)
      try {
        this.transport.sendMail(
          {
            replyTo: this.config.get<string>('EMAIL_FROM_BEWERBUNG'),
            to: user.email,
            subject: 'Schülertreff - Terminvorschläge Bewerbungsgespräch',
            text: applicationMeetingProposalMail(
              user.firstName + ' ' + user.lastName,
              'https://us04web.zoom.us/j/73707078960?pwd=aWFFbThlTVIrTzQ5dWZVYlVzYWNqdz09',
              dto.dates.map(
                (date) =>
                  `- ${dayjs(date).locale('de').format('dddd')}, den ${dayjs(
                    date,
                  ).format('DD.MM.YYYY')} um ${dayjs(date).format(
                    'HH:mm',
                  )} Uhr`,
              ),
            ),
          },
          (error) => {
            if (error) console.log(error)
          },
        )
        console.log('Meeting-Proposal-Mail successfully sent to ' + user.email)
      } catch {
        console.log('Failed to send meeting suggestions email to ' + user.email)
      }
    }

    user.state = TeacherState.INTERVIEW

    return this.teachersRepository.save(user).then(transformUser)
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
        this.teachersRepository.update(id, { deleteState: UserDeleteState.DELETED })
      } else {
        throw new BadRequestException(
          'Teacher cannot be deleted: there are ongoing or future contracts with this teacher',
        )
      }
    } else {
      if ((await this.findOneTeacher(id)).deleteState === UserDeleteState.ACTIVE) {
        this.teachersRepository.update(id, { deleteState: UserDeleteState.DELETED })
      } else {
        this.teachersRepository.delete(id)
      }
    }
  }

  /**
   *
   * Customer functions
   *
   **/

  async findAllCustomers(): Promise<Customer[]> {
    return await this.customersRepository
      .find({
        order: { firstName: 'ASC', lastName: 'ASC' },
      })
      .then(transformUsers)
  }

  checkCustomersEqual(customers: Customer[], ids: number[]): boolean {
    const customerIds = customers.map((c) => c.id)

    if (customerIds.sort().join(',') === ids.sort().join(',')) {
      return true
    } else {
      return false
    }
  }

  async findOneCustomer(id: number): Promise<Customer> {
    return this.customersRepository.findOneByOrFail({ id }).then(transformUser)
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
    const customer = await this.findOneCustomer(id)

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
          deleteState: UserDeleteState.DELETED,
        })
      } else {
        throw new BadRequestException(
          'Customer cannot be deleted: there are ongoing or future contracts with this customer',
        )
      }
    } else {
      if (
        customer.deleteState !== UserDeleteState.DELETED &&
        customer.role === UserRole.PRIVATECUSTOMER
      ) {
        this.privateCustomersRepository.update(id, {
          deleteState: UserDeleteState.DELETED,
        })
      } else {
        this.customersRepository.delete(id)
      }
    }
  }

  /**
   *
   * PrivateCustomer functions
   *
   **/

  async findPrivateCustomers(): Promise<PrivateCustomer[]> {
    return this.privateCustomersRepository
      .find({
        where: { deleteState: Not(UserDeleteState.DELETED) },
        order: { firstName: 'ASC', lastName: 'ASC' },
      })
      .then(transformUsers)
  }

  async findDeletedPrivateCustomers(): Promise<PrivateCustomer[]> {
    return this.privateCustomersRepository
      .find({
        where: { deleteState: UserDeleteState.DELETED },
        order: { firstName: 'ASC', lastName: 'ASC' },
      })
      .then(transformUsers)
  }

  async findOnePrivateCustomer(id: number): Promise<PrivateCustomer> {
    return this.privateCustomersRepository
      .findOneByOrFail({ id })
      .then(transformUser)
  }

  async createPrivateCustomer(
    dto: CreatePrivateCustomerDto,
  ): Promise<PrivateCustomer> {
    const privateCustomer = this.privateCustomersRepository.create({
      ...dto,
      timesAvailable: parseTSTZMultirange(dto.timesAvailable),
      mayAuthenticate: false,
    })

    return this.privateCustomersRepository.save(privateCustomer)
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
        timesAvailable: parseTSTZMultirange(dto.timesAvailable),
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
        timesAvailable: parseTSTZMultirange(dto.timesAvailable),
      })
      .then(transformUser)
  }

  /**
   *
   * School functions
   *
   **/

  async findSchools(): Promise<School[]> {
    return this.schoolsRepository
      .find({
        where: { deleteState: Not(UserDeleteState.DELETED) },
        order: { schoolName: 'ASC' },
      })
      .then(transformUsers)
  }

  async findDeletedSchools(): Promise<School[]> {
    return this.schoolsRepository
      .find({
        where: { deleteState: UserDeleteState.DELETED },
        order: { schoolName: 'ASC' },
      })
      .then(transformUsers)
  }

  async findOneSchool(id: number): Promise<School> {
    return this.schoolsRepository.findOneByOrFail({ id }).then(transformUser)
  }

  async findSchoolsWithStartInFuture(date: string): Promise<School[]> {
    const qb = this.schoolsRepository.createQueryBuilder('s')
    const week = dayjs(date, 'YYYY-MM-DD')

    qb.select(['s'])
      .where(`s.dateOfStart >= date_trunc('week', :week::date)`, {
        week: dayjs(week).format(),
      })
      .andWhere(
        `s.dateOfStart < date_trunc('week', :week::date) + interval '7 day'`,
      )
      .orderBy('s.dateOfStart', 'ASC')

    return qb.getMany()
  }

  async createSchool(dto: CreateSchoolDto): Promise<School> {
    const school = this.schoolsRepository.create({
      ...dto,
      mayAuthenticate: false,
    })

    return this.schoolsRepository.save(school)
  }

  async updateSchool(
    id: number,
    dto: Partial<UpdateSchoolDto>,
  ): Promise<School> {
    const school = await this.findOneSchool(id)

    const updatedSchool = {
      ...school,
      ...dto,
      timesAvailable: `{${MAX_TIME_RANGE}}`,
    }

    if (
      school.schoolState !== SchoolState.CONFIRMED &&
      updatedSchool.schoolState === SchoolState.CONFIRMED
    ) {
      updatedSchool.mayAuthenticate = true

      this.authService.initReset(school)
    }

    if (school.email !== updatedSchool.email && school.mayAuthenticate) {
      this.authService.initReset(school)
    }

    return this.schoolsRepository.save(updatedSchool).then(transformUser)
  }

  async deleteSchool(id: number) {
    const qb = this.connection.createQueryBuilder()

    const classCustomerQuery = qb
      .select('c')
      .from(ClassCustomer, 'c')
      .leftJoin('c.school', 's')
      .where('s.id = :id', { id: id })

    const classCustomers = await classCustomerQuery.getMany()
    const school = await this.findOneSchool(id)

    let allowedToRemove = true

    if (classCustomers.length > 0) {
      for (const classCustomer of classCustomers) {
        if (classCustomer.deleteState !== UserDeleteState.DELETED) {
          allowedToRemove = false
          break
        }
      }

      if (allowedToRemove) {
        this.schoolsRepository.update(id, {
          deleteState: UserDeleteState.DELETED,
        })
      } else {
        throw new BadRequestException(
          'School cannot be deleted: first delete every class',
        )
      }
    } else {
      if (school.deleteState !== UserDeleteState.DELETED) {
        this.schoolsRepository.update(id, {
          deleteState: UserDeleteState.DELETED,
        })
      } else {
        this.schoolsRepository.delete(id)
      }
    }
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
      .andWhere('c.defaultClassCustomer = FALSE')
      .andWhere('c.deleteState = :deleteState', {
        deleteState: UserDeleteState.ACTIVE,
      })
      .orderBy('c.className', 'ASC')

    return q.getMany().then(transformUsers)
  }

  async findOrCreateDefaultClassCustomer(
    schoolId?: number,
  ): Promise<ClassCustomer> {
    const q = this.classCustomersRepository
      .createQueryBuilder('c')
      .leftJoin('c.school', 'school')
      .select(['c', 'school'])
      .where('c.schoolId = :schoolId', {
        schoolId: schoolId,
      })
      .andWhere('c.defaultClassCustomer = TRUE')
      .orderBy('c.className', 'ASC')

    const defaultClassCustomers = await q.getMany()

    if (defaultClassCustomers.length === 0) {
      const newDefaultClassCustomer = this.classCustomersRepository.create({
        mayAuthenticate: false,
        street: null,
        city: null,
        postalCode: null,
        email: null,
        phone: null,
        school: { id: schoolId },
        defaultClassCustomer: true,
      })

      const savedClassCustomer = await this.classCustomersRepository.save(
        newDefaultClassCustomer,
      )

      defaultClassCustomers.push(savedClassCustomer)
    }

    return defaultClassCustomers[0]
  }

  /**
   *
   * ClassCustomer functions
   *
   **/

  async createClassCustomer(
    dto: CreateClassCustomerDto,
  ): Promise<ClassCustomer> {
    const classCustomer = this.classCustomersRepository.create({
      ...dto,
      timesAvailable: parseTSTZMultirange(dto.timesAvailable),
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

  async findClassCustomers(): Promise<ClassCustomer[]> {
    return this.classCustomersRepository
      .find({
        where: { deleteState: Not(UserDeleteState.DELETED) },
        order: { className: 'ASC' },
      })
      .then(transformUsers)
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
        timesAvailable: parseTSTZMultirange(dto.timesAvailable),
      })
      .then(transformUser)
  }
}
