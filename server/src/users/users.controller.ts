import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
} from '@nestjs/common'

import { AuthService } from 'src/auth/auth.service'
import { Public } from 'src/auth/decorators/public.decorator'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { Role } from 'src/auth/role.enum'

import { CreateAdminDto } from './dto/create-admin.dto'
import { CreateClassCustomerDto } from './dto/create-classCustomer.dto'
import { CreatePrivateCustomerDto } from './dto/create-privateCustomer.dto'
import { CreateSchoolCustomerDto } from './dto/create-schoolCustomer.dto'
import { CreateTeacherDto } from './dto/create-teacher.dto'
import { UpdatePrivateCustomerDto } from './dto/update-privateCustomer.dto'
import { UpdateTeacherDto } from './dto/update-teacher.dto'

import {
  Admin,
  Customer,
  PrivateCustomer,
  SchoolCustomer,
  Teacher,
  User,
  ClassCustomer,
} from './entities'
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

  @Get('privateCustomer')
  findAllPrivateCustomers(): Promise<PrivateCustomer[]> {
    return this.usersService.findAllPrivateCustomers()
  }

  @Get('classCustomer')
  findAllClassCustomers(): Promise<ClassCustomer[]> {
    return this.usersService.findAllClassCustomers()
  }

  @Get('schoolCustomer')
  findAllSchoolCustomers(): Promise<SchoolCustomer[]> {
    return this.usersService.findAllSchoolCustomers()
  }

  @Get('teacher')
  findAllTeachers(): Promise<Teacher[]> {
    return this.usersService.findAllTeachers()
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


  @Get('teacher/me')
  getMeAsTeacher(@Request() req) {
    return this.usersService.findOneTeacher(req.user.id)
  }

  @Get('teacher/:id')
  @Roles(Role.ADMIN)
  findOneTeacher(@Param('id') id: number): Promise<Teacher> {
    return this.usersService.findOneTeacher(id)
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: number): Promise<void> {
    return this.usersService.remove(id)
  }

  @Post('privateCustomer')
  @Roles(Role.ADMIN)
  async createPrivateCustomer(
    @Body() dto: CreatePrivateCustomerDto,
  ): Promise<PrivateCustomer> {
    return this.usersService.createPrivateCustomer(dto)
  }

  @Post('classCustomer')
  @Public()
  //@Roles(Role.ADMIN)
  async createClassCustomer(
    @Body() dto: CreateClassCustomerDto,
  ): Promise<ClassCustomer> {
    return this.usersService.createClassCustomer(dto)
  }

  @Post('schoolCustomer')
  @Roles(Role.ADMIN)
  async createSchoolCustomer(
    @Body() dto: CreateSchoolCustomerDto,
  ): Promise<SchoolCustomer> {
    return this.usersService.createSchoolCustomer(dto)
  }

  @Post('teacher')
  @Roles(Role.ADMIN)
  async createTeacher(@Body() dto: CreateTeacherDto): Promise<Teacher> {
    const user = await this.usersService.createTeacher(dto)

    this.authService.initReset(user)

    return user
  }

  @Post('privateCustomer/me')
  async updatePrivateCustomer(
    @Request() req,
    @Body() dto: UpdatePrivateCustomerDto,
  ): Promise<User> {
    return this.usersService.updatePrivateCustomer(req.user.id, dto)
  }

  @Post('privateCustomer/:id')
  @Roles(Role.ADMIN)
  async updatePrivateCustomerAdmin(
    @Param('id') id: number,
    @Body() dto: UpdatePrivateCustomerDto,
  ): Promise<User> {
    return this.usersService.updatePrivateCustomerAdmin(id, dto)
  }

  @Post('teacher/me')
  async updateTeacher(
    @Request() req,
    @Body() dto: UpdateTeacherDto,
  ): Promise<User> {

    return this.usersService.updateTeacher(req.user.id, dto)
  }

  @Post('teacher/:id')
  @Roles(Role.ADMIN)
  async updateTeacherAdmin(
    @Param('id') id: number,
    @Body() dto: UpdateTeacherDto,
  ): Promise<User> {

    return this.usersService.updateTeacherAdmin(id, dto)
  }

  @Post('admin')
  @Roles(Role.ADMIN)
  async createAdmin(@Body() dto: CreateAdminDto): Promise<Admin> {
    const user = await this.usersService.createAdmin(dto)

    this.authService.initReset(user)

    return user
  }

}
