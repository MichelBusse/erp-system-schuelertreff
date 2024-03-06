import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  Request,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import dayjs from 'dayjs'
import { Response } from 'express'
import { UsersService } from '../services/users.service'
import UserRole from 'src/core/enums/UserRole.enum'
import { User } from '../entities/user.entity'
import { Customer } from '../entities/customer.entity'
import { PrivateCustomer } from '../entities/privateCustomer.entity'
import { ClassCustomer } from '../entities/classCustomer.entity'
import { School } from '../entities/school.entity'
import { Teacher } from '../entities/teacher.entity'
import { CreateSchoolDto } from '../dto/create-school.dto'
import { UpdateSchoolDto } from '../dto/update-school.dto'
import { UpdateClassCustomerDto } from '../dto/update-classCustomer.dto'
import { CreatePrivateCustomerDto } from '../dto/create-privateCustomer.dto'
import { UpdatePrivateCustomerDto } from '../dto/update-privateCustomer.dto'
import { UpdateTeacherDto } from '../dto/update-teacher.dto'
import { RequestApplicationMeetingDto } from '../dto/request-application-meeting.dto'
import { CreateTeacherDto } from '../dto/create-teacher.dto'
import { CreateAdminDto } from '../dto/create-admin.dto'
import { Admin } from '../entities/Admin.entity'
import { LeaveDto } from '../dto/leave.dto'
import LeaveState from 'src/core/enums/LeaveState.enum'
import { CreateClassCustomerDto } from '../dto/create-classCustomer.dto'
import { UserDocument } from 'src/features/user-documents/entities/UserDocument.entity'
import { AuthService } from 'src/features/auth/services/auth.service'
import { Leave } from '../entities/Leave'
import { Roles } from 'src/core/decorators/roles.decorator'

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll(): Promise<User[]> {
    return this.usersService.findAll()
  }

  @Get('customer')
  @Roles(UserRole.ADMIN)
  findAllCustomers(): Promise<Customer[]> {
    return this.usersService.findAllCustomers()
  }

  @Get('unarchive/:id')
  @Roles(UserRole.ADMIN)
  unarchiveUser(@Param('id') id: number): Promise<void> {
    return this.usersService.unarchiveUser(id)
  }

  @Get('privateCustomer')
  @Roles(UserRole.ADMIN)
  findAppliedPrivateCustomers(): Promise<PrivateCustomer[]> {
    return this.usersService.findPrivateCustomers()
  }

  @Get('privateCustomer/deleted')
  @Roles(UserRole.ADMIN)
  findDeletedPrivateCustomers(): Promise<PrivateCustomer[]> {
    return this.usersService.findDeletedPrivateCustomers()
  }

  @Get('classCustomer')
  @Roles(UserRole.ADMIN)
  findAllClassCustomers(): Promise<ClassCustomer[]> {
    return this.usersService.findClassCustomers()
  }

  @Get('classCustomer/me')
  findMyClassesOfSchool(@Request() req) {
    return this.usersService.findAllClassesOfSchool(req.user.id)
  }

  @Get('classCustomer/:schoolId')
  @Roles(UserRole.ADMIN)
  findAllClassesOfSchool(
    @Param('schoolId') schoolId: number,
  ): Promise<ClassCustomer[]> {
    return this.usersService.findAllClassesOfSchool(schoolId)
  }

  @Get('school')
  @Roles(UserRole.ADMIN)
  findAllSchools(): Promise<School[]> {
    return this.usersService.findSchools()
  }
  @Get('school/deleted')
  @Roles(UserRole.ADMIN)
  findDeletedSchools(): Promise<School[]> {
    return this.usersService.findDeletedSchools()
  }

  @Get('school/startInFuture')
  @Roles(UserRole.ADMIN)
  findSchoolsWithStartInFuture(@Query('of') date: string): Promise<School[]> {
    return this.usersService.findSchoolsWithStartInFuture(date)
  }

  @Get('teacher')
  @Roles(UserRole.ADMIN)
  findTeachers(): Promise<Teacher[]> {
    return this.usersService.findTeachers()
  }

  @Get('teacher/employed')
  @Roles(UserRole.ADMIN)
  findEmployedTeachers(): Promise<Teacher[]> {
    return this.usersService.findEmployedTeachers()
  }

  @Get('teacher/applied')
  @Roles(UserRole.ADMIN)
  findAppliedTeachers(): Promise<Teacher[]> {
    return this.usersService.findAppliedTeachers()
  }

  @Get('teacher/employed/deleted')
  @Roles(UserRole.ADMIN)
  findEmployedDeletedTeachers(): Promise<Teacher[]> {
    return this.usersService.findEmployedDeletedTeachers()
  }

  @Get('teacher/applied/deleted')
  @Roles(UserRole.ADMIN)
  findAppliedDeletedTeachers(): Promise<Teacher[]> {
    return this.usersService.findAppliedDeletedTeachers()
  }

  @Get('school/me')
  findMySchool(@Request() req) {
    return this.usersService.findOneSchool(req.user.id)
  }

  @Get('school/:id')
  @Roles(UserRole.ADMIN)
  findOneSchool(@Param('id') id: number): Promise<School> {
    return this.usersService.findOneSchool(id)
  }

  @Get('privateCustomer/me')
  getMe(@Request() req) {
    return this.usersService.findOnePrivateCustomer(req.user.id)
  }

  @Get('privateCustomer/:id')
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: number): Promise<PrivateCustomer> {
    return this.usersService.findOnePrivateCustomer(id)
  }

  @Post('school')
  @Roles(UserRole.ADMIN)
  async createSchool(@Body() dto: CreateSchoolDto): Promise<School> {
    if (await this.usersService.checkDuplicateEmail(dto.email))
      throw new BadRequestException('Email ist bereits im System registriert.')

    const user = await this.usersService.createSchool(dto)

    if (user.mayAuthenticate) this.authService.initReset(user)

    return user
  }

  @Post('school/me')
  async updateMySchool(
    @Request() req,
    @Body() dto: UpdateSchoolDto,
  ): Promise<School> {
    return this.usersService.updateSchool(req.user.id, {
      firstName: dto.firstName,
      lastName: dto.lastName,
      schoolTypes: dto.schoolTypes,
      street: dto.street,
      postalCode: dto.postalCode,
      city: dto.city,
      phone: dto.phone,
    })
  }

  @Post('school/:id')
  @Roles(UserRole.ADMIN)
  async updateSchoolAdmin(
    @Param('id') id: number,
    @Body() dto: UpdateSchoolDto,
  ): Promise<School> {
    return this.usersService.updateSchool(id, dto)
  }

  @Post('classCustomer')
  @Roles(UserRole.ADMIN, UserRole.SCHOOL)
  async createClassCustomer(
    @Request() req,
    @Body() dto: CreateClassCustomerDto,
  ): Promise<ClassCustomer> {
    if (dto.school === -1) {
      dto.school = req.user.id
    }
    return this.usersService.createClassCustomer(dto)
  }

  @Post('classCustomer/:id')
  @Roles(UserRole.ADMIN, UserRole.SCHOOL)
  async updateClassCustomer(
    @Param('id') id: number,
    @Body() dto: UpdateClassCustomerDto,
  ): Promise<ClassCustomer> {
    return this.usersService.updateClassCustomerAdmin(id, dto)
  }

  @Post('privateCustomer')
  @Roles(UserRole.ADMIN)
  async createPrivateCustomer(
    @Body() dto: CreatePrivateCustomerDto,
  ): Promise<PrivateCustomer> {
    if (await this.usersService.checkDuplicateEmail(dto.email))
      throw new BadRequestException('Email ist bereits im System registriert.')

    return this.usersService.createPrivateCustomer(dto)
  }

  @Post('privateCustomer/me')
  async updatePrivateCustomer(
    @Request() req,
    @Body() dto: UpdatePrivateCustomerDto,
  ): Promise<PrivateCustomer> {
    return this.usersService.updatePrivateCustomer(req.user.id, dto)
  }

  @Post('privateCustomer/:id')
  @Roles(UserRole.ADMIN)
  async updatePrivateCustomerAdmin(
    @Param('id') id: number,
    @Body() dto: UpdatePrivateCustomerDto,
  ): Promise<PrivateCustomer> {
    return this.usersService.updatePrivateCustomerAdmin(id, dto)
  }

  @Get('teacher/all')
  @Roles(UserRole.ADMIN)
  getAllTeachers() {
    return this.usersService.findTeachers()
  }

  @Get('teacher/me')
  getMeAsTeacher(@Request() req) {
    return this.usersService.findOneTeacher(req.user.id)
  }

  @Get('teacher/generateWorkContract')
  @Roles(UserRole.ADMIN)
  async generateWorkContract(
    @Query('teacherId') id: number,
  ): Promise<UserDocument> {
    return this.usersService.generateWorkContract(id)
  }

  @Get('teacher/generateEFZ')
  @Roles(UserRole.ADMIN)
  async generateEFZ(@Query('teacherId') id: number): Promise<UserDocument> {
    return this.usersService.generateEFZ(id)
  }

  @Get('teacher/applicationMeetings')
  @Roles(UserRole.ADMIN)
  async getApplicationMeetings(@Query('of') day: string) {
    if (!dayjs(day).isValid()) throw new BadRequestException()

    return this.usersService.getApplicationMeetings(
      dayjs(day).format('YYYY-MM-DD'),
      dayjs(day).format('YYYY-MM-DD'),
    )
  }

  @Get('teacher/:id')
  findOneTeacher(
    @Request() req,
    @Param('id') id: number,
  ): Promise<Partial<Teacher>> {
    if (req.user.role === UserRole.ADMIN) {
      return this.usersService.findOneTeacher(id)
    } else if (req.user.role === UserRole.SCHOOL) {
      return this.usersService.findOneTeacherAsSchool(id)
    }
    throw new ForbiddenException(
      'You do not have permission to request this teacher',
    )
  }

  @Post('teacher/me')
  async updateTeacher(
    @Request() req,
    @Body() dto: UpdateTeacherDto,
  ): Promise<Teacher> {
    return this.usersService.updateTeacher(req.user.id, {
      street: dto.street,
      postalCode: dto.postalCode,
      subjects: dto.subjects,
      phone: dto.phone,
      city: dto.city,
      teacherSchoolTypes: dto.teacherSchoolTypes,
      dateOfBirth: dto.dateOfBirth,
      bankAccountOwner: dto.bankAccountOwner,
      bankInstitution: dto.bankInstitution,
      iban: dto.iban,
      bic: dto.bic,
      timesAvailable: dto.timesAvailable,
    })
  }

  @Post('teacher/applicationMeetingRequest/:id')
  @Roles(UserRole.ADMIN)
  async sendApplicationMeetingRequest(
    @Param('id') id: number,
    @Body() dto: RequestApplicationMeetingDto,
  ): Promise<Teacher> {
    return this.usersService.sendApplicationMeetingRequest(id, dto)
  }

  @Post('teacher/:id')
  @Roles(UserRole.ADMIN)
  async updateTeacherAdmin(
    @Param('id') id: number,
    @Body() dto: UpdateTeacherDto,
  ): Promise<Teacher> {
    const oldTeacher = await this.usersService.findOneTeacher(id)
    const updatedTeacher = await this.usersService.updateTeacher(id, dto)

    // send password reset email if mayauthenticate changed
    if (!oldTeacher.mayAuthenticate && updatedTeacher.mayAuthenticate)
      this.authService.initReset(updatedTeacher)

    return updatedTeacher
  }

  @Post('teacher')
  @Roles(UserRole.ADMIN)
  async createTeacher(@Body() dto: CreateTeacherDto): Promise<Teacher> {
    if (await this.usersService.checkDuplicateEmail(dto.email))
      throw new BadRequestException('Email ist bereits im System registriert.')

    const user = await this.usersService.createTeacher(dto)

    if (user.mayAuthenticate) this.authService.initReset(user)

    return user
  }

  @Delete('teacher/:id')
  @Roles(UserRole.ADMIN)
  async deleteTeacher(@Param('id') id: number): Promise<void> {
    return this.usersService.deleteTeacher(id)
  }

  @Delete('privateCustomer/:id')
  @Roles(UserRole.ADMIN)
  async deletePrivateCustomer(@Param('id') id: number): Promise<void> {
    return this.usersService.deleteCustomer(id)
  }

  @Delete('school/:id')
  @Roles(UserRole.ADMIN)
  async deletSchool(@Param('id') id: number): Promise<void> {
    return this.usersService.deleteSchool(id)
  }

  @Delete('classCustomer/:id')
  @Roles(UserRole.ADMIN)
  async deletClassCustomer(@Param('id') id: number): Promise<void> {
    return this.usersService.deleteCustomer(id)
  }

  @Post('admin')
  @Roles(UserRole.ADMIN)
  async createAdmin(@Body() dto: CreateAdminDto): Promise<Admin> {
    const user = await this.usersService.createAdmin(dto)

    this.authService.initReset(user)

    return user
  }

  @Get('me/leave/:id')
  async getOwnLeaveAttachment(
    @Request() req,
    @Res() res: Response,
    @Param('id') id: number,
  ) {
    this.getLeaveAttachment(res, req.user.id, id)
  }

  @Roles(UserRole.ADMIN)
  @Get(':userId/leave/:id')
  async getLeaveAttachment(
    @Res() res: Response,
    @Param('userId') userId: number,
    @Param('id') id: number,
  ) {
    const buffer = await this.usersService.getLeaveAttachment(id, userId)

    const fileType = await this.usersService.fileTypeFromBuffer(buffer)

    res.set({
      'Content-Type': fileType.mime,
      // 'Content-Disposition': 'attachment; filename=test.' + fileType.ext,
      'Content-Length': buffer.length,
    })

    res.end(buffer)
  }

  @Post('me/leave')
  async createOwnLeave(@Request() req, @Body() dto: LeaveDto): Promise<Leave> {
    return this.createLeave(req.user.id, { ...dto, state: LeaveState.PENDING })
  }

  @Roles(UserRole.ADMIN)
  @Post(':userId/leave')
  async createLeave(
    @Param('userId') userId: number,
    @Body() dto: LeaveDto,
  ): Promise<Leave> {
    return this.usersService.createLeave(userId, dto)
  }

  // @Post('me/leave/:id')
  // async updateOwnLeave(
  //   @Request() req,
  //   @Param('id') id: number,
  //   @Body() dto: LeaveDto,
  // ): Promise<Leave> {
  //   const cleanDto: LeaveDto = {
  //     startDate: dto.startDate,
  //     endDate: dto.endDate,
  //     type: dto.type,
  //   }

  //   return this.updateLeave(req.user.id, id, cleanDto)
  // }

  @Roles(UserRole.ADMIN)
  @Post(':userId/leave/:id')
  async updateLeave(
    @Param('userId') userId: number,
    @Param('id') id: number,
    @Body() dto: LeaveDto,
  ): Promise<Leave> {
    return this.usersService.updateLeave(id, userId, dto)
  }

  @Post('me/leave/:id/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadOwnLeaveAttachment(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: number,
    @Request() req,
  ) {
    return this.uploadLeaveAttachment(file, id, req.user.id)
  }

  @Roles(UserRole.ADMIN)
  @Post(':userId/leave/:id/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLeaveAttachment(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: number,
    @Param('userId') userId: number,
  ) {
    const dto: LeaveDto = {
      attachment: file.buffer,
    }

    return this.usersService.updateLeave(id, userId, dto)
  }

  @Delete('me/leave/:id')
  async deleteOwnLeave(@Request() req, @Param('id') id: number) {
    return this.deleteLeave(req.user.id, id)
  }

  @Roles(UserRole.ADMIN)
  @Delete(':userId/leave/:id')
  async deleteLeave(@Param('userId') userId: number, @Param('id') id: number) {
    return this.usersService.deleteLeave(id, userId)
  }

  @Roles(UserRole.ADMIN)
  @Get('leaves/intersecting')
  async getIntersectingLeaves(
    @Query('start') start: string,
    @Query('end') end: string,
  ): Promise<Leave[]> {
    return this.usersService.getIntersectingLeaves(start, end)
  }

  @Roles(UserRole.ADMIN)
  @Get('leaves/:state')
  async getLeaves(@Param('state') state: LeaveState) {
    return this.usersService.getLeaves(state)
  }
}
