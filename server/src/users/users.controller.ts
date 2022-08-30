import {
  BadRequestException,
  Body,
  Controller,
  Delete,
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

import { AuthService } from 'src/auth/auth.service'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { Role } from 'src/auth/role.enum'
import { Document } from 'src/documents/document.entity'

import { ApplicationMeetingRequestDto } from './dto/application-meeting-request.dto'
import { CreateAdminDto } from './dto/create-admin.dto'
import { CreateClassCustomerDto } from './dto/create-classCustomer.dto'
import { CreatePrivateCustomerDto } from './dto/create-privateCustomer.dto'
import { CreateSchoolDto } from './dto/create-school.dto'
import { CreateTeacherDto } from './dto/create-teacher.dto'
import { LeaveDto } from './dto/leave.dto'
import { UpdateClassCustomerDto } from './dto/update-classCustomer.dto'
import { UpdatePrivateCustomerDto } from './dto/update-privateCustomer.dto'
import { UpdateSchoolDto } from './dto/update-school.dto'
import { UpdateTeacherDto } from './dto/update-teacher.dto'
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
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll()
  }

  @Get('customer')
  findAllCustomers(): Promise<Customer[]> {
    return this.usersService.findAllCustomers()
  }

  @Get('unarchive/:id')
  @Roles(Role.ADMIN)
  unarchiveUser(@Param('id') id: number): Promise<void> {
    return this.usersService.unarchiveUser(id)
  }

  @Get('privateCustomer')
  findAppliedPrivateCustomers(): Promise<PrivateCustomer[]> {
    return this.usersService.findPrivateCustomers()
  }

  @Get('privateCustomer/deleted')
  findDeletedPrivateCustomers(): Promise<PrivateCustomer[]> {
    return this.usersService.findDeletedPrivateCustomers()
  }

  @Get('classCustomer')
  findAllClassCustomers(): Promise<ClassCustomer[]> {
    return this.usersService.findClassCustomers()
  }

  @Get('classCustomer/:schoolId')
  findAllClassesOfSchool(
    @Param('schoolId') schoolId: number,
  ): Promise<ClassCustomer[]> {
    return this.usersService.findAllClassesOfSchool(schoolId)
  }

  @Get('school')
  findAllSchools(): Promise<School[]> {
    return this.usersService.findSchools()
  }
  @Get('school/deleted')
  findDeletedSchools(): Promise<School[]> {
    return this.usersService.findDeletedSchools()
  }

  @Get('school/startInFuture')
  findSchoolsWithStartInFuture(@Query('of') date: string): Promise<School[]> {
    return this.usersService.findSchoolsWithStartInFuture(date)
  }

  @Get('teacher')
  findAppliedTeachers(): Promise<Teacher[]> {
    return this.usersService.findTeachers()
  }

  @Get('teacher/deleted')
  findDeletedTeachers(): Promise<Teacher[]> {
    return this.usersService.findDeletedTeachers()
  }

  @Get('school/:id')
  @Roles(Role.ADMIN)
  findOneSchool(@Param('id') id: number): Promise<School> {
    return this.usersService.findOneSchool(id)
  }

  @Get('privateCustomer/me')
  getMe(@Request() req) {
    return this.usersService.findOnePrivateCustomer(req.user.id)
  }

  @Get('privateCustomer/:id')
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: number): Promise<PrivateCustomer> {
    return this.usersService.findOnePrivateCustomer(id)
  }

  @Post('school')
  @Roles(Role.ADMIN)
  async createSchool(@Body() dto: CreateSchoolDto): Promise<School> {
    if (await this.usersService.checkDuplicateEmail(dto.email))
      throw new BadRequestException('Email ist bereits im System registriert.')

    return this.usersService.createSchool(dto)
  }

  @Post('school/:id')
  @Roles(Role.ADMIN)
  async updateSchoolAdmin(
    @Param('id') id: number,
    @Body() dto: UpdateSchoolDto,
  ): Promise<School> {
    return this.usersService.updateSchoolAdmin(id, dto)
  }

  @Post('classCustomer')
  @Roles(Role.ADMIN)
  async createClassCustomer(
    @Body() dto: CreateClassCustomerDto,
  ): Promise<ClassCustomer> {
    return this.usersService.createClassCustomer(dto)
  }

  @Post('classCustomer/:id')
  @Roles(Role.ADMIN)
  async updateClassCustomer(
    @Param('id') id: number,
    @Body() dto: UpdateClassCustomerDto,
  ): Promise<ClassCustomer> {
    return this.usersService.updateClassCustomerAdmin(id, dto)
  }

  @Post('privateCustomer')
  @Roles(Role.ADMIN)
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
  @Roles(Role.ADMIN)
  async updatePrivateCustomerAdmin(
    @Param('id') id: number,
    @Body() dto: UpdatePrivateCustomerDto,
  ): Promise<PrivateCustomer> {
    return this.usersService.updatePrivateCustomerAdmin(id, dto)
  }

  @Get('teacher/all')
  @Roles(Role.ADMIN)
  getAllTeachers() {
    return this.usersService.findTeachers()
  }

  @Get('teacher/me')
  getMeAsTeacher(@Request() req) {
    return this.usersService.findOneTeacher(req.user.id)
  }

  @Get('teacher/generateWorkContract')
  @Roles(Role.ADMIN)
  async generateWorkContract(
    @Query('teacherId') id: number,
  ): Promise<Document> {
    return this.usersService.generateWorkContract(id)
  }

  @Get('teacher/generateEFZ')
  @Roles(Role.ADMIN)
  async generateEFZ(
    @Query('teacherId') id: number,
  ): Promise<Document> {
    return this.usersService.generateEFZ(id)
  }

  @Get('teacher/applicationMeetings')
  @Roles(Role.ADMIN)
  async getApplicationMeetings(@Query('of') week: string) {
    if (!dayjs(week).isValid()) throw new BadRequestException()

    return this.usersService.getApplicationMeetings(
      dayjs(week).day(1).format('YYYY-MM-DD'),
      dayjs(week).day(7).format('YYYY-MM-DD'),
    )
  }

  @Get('teacher/:id')
  @Roles(Role.ADMIN)
  findOneTeacher(@Param('id') id: number): Promise<Teacher> {
    return this.usersService.findOneTeacher(id)
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
  @Roles(Role.ADMIN)
  async sendApplicationMeetingRequest(
    @Param('id') id: number,
    @Body() dto: ApplicationMeetingRequestDto,
  ): Promise<Teacher> {
    return this.usersService.sendApplicationMeetingRequest(id, dto)
  }

  @Post('teacher/:id')
  @Roles(Role.ADMIN)
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
  @Roles(Role.ADMIN)
  async createTeacher(@Body() dto: CreateTeacherDto): Promise<Teacher> {
    if (await this.usersService.checkDuplicateEmail(dto.email))
      throw new BadRequestException('Email ist bereits im System registriert.')

    const user = await this.usersService.createTeacher(dto)

    if (dto.skip) this.authService.initReset(user)

    return user
  }

  @Delete('teacher/:id')
  @Roles(Role.ADMIN)
  async deleteTeacher(@Param('id') id: number): Promise<void> {
    return this.usersService.deleteTeacher(id)
  }

  @Delete('privateCustomer/:id')
  @Roles(Role.ADMIN)
  async deletePrivateCustomer(@Param('id') id: number): Promise<void> {
    return this.usersService.deleteCustomer(id)
  }

  @Delete('school/:id')
  @Roles(Role.ADMIN)
  async deletSchool(@Param('id') id: number): Promise<void> {
    return this.usersService.deleteSchool(id)
  }

  @Delete('classCustomer/:id')
  @Roles(Role.ADMIN)
  async deletClassCustomer(@Param('id') id: number): Promise<void> {
    return this.usersService.deleteCustomer(id)
  }

  @Post('admin')
  @Roles(Role.ADMIN)
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

  @Roles(Role.ADMIN)
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

  @Roles(Role.ADMIN)
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

  @Roles(Role.ADMIN)
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

  @Roles(Role.ADMIN)
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

  @Roles(Role.ADMIN)
  @Delete(':userId/leave/:id')
  async deleteLeave(@Param('userId') userId: number, @Param('id') id: number) {
    return this.usersService.deleteLeave(id, userId)
  }

  @Roles(Role.ADMIN)
  @Get('leaves/intersecting')
  async getIntersectingLeaves(
    @Query('start') start: string,
    @Query('end') end: string,
  ): Promise<Leave[]> {
    return this.usersService.getIntersectingLeaves(start, end)
  }

  @Roles(Role.ADMIN)
  @Get('leaves/:state')
  async getLeaves(@Param('state') state: LeaveState) {
    return this.usersService.getLeaves(state)
  }
}
