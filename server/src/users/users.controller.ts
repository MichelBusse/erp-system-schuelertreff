import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
} from '@nestjs/common'
import { isPostalCode } from 'class-validator'

import { AuthService } from 'src/auth/auth.service'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { Role } from 'src/auth/role.enum'
import { ChildEntity } from 'typeorm'

import { CreateAdminDto } from './dto/create-admin.dto'
import { CreatePrivateCustomerDto } from './dto/create-privateCustomer.dto'
import { CreateSchoolCustomerDto } from './dto/create-schoolCustomer.dto'
import { CreateTeacherDto } from './dto/create-teacher.dto'
import { timeAvailable } from './dto/timeAvailable'
import {
  Admin,
  Customer,
  PrivateCustomer,
  SchoolCustomer,
  Teacher,
  User,
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

  @Get('schoolCustomer')
  findAllSchoolCustomers(): Promise<SchoolCustomer[]> {
    return this.usersService.findAllSchoolCustomers()
  }

  @Get('teacher')
  findAllTeachers(): Promise<Teacher[]> {
    return this.usersService.findAllTeachers()
  }

  @Get('me')
  getMe(@Request() req) {
    return this.usersService.findOne(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<User> {
    return this.usersService.findOne(id)
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

  @Post('admin')
  @Roles(Role.ADMIN)
  async createAdmin(@Body() dto: CreateAdminDto): Promise<Admin> {
    const user = await this.usersService.createAdmin(dto)

    this.authService.initReset(user)

    return user
  }

  @Post(':id')
  async updateUser(
    @Param('id') id: number, 
    @Body('street') street: string, 
    @Body('postalCode') postalCode: string,
    @Body('city') city: string,
    @Body('phone') phone: string,
    @Body('timesAvailable') timesAvailable: string & timeAvailable[]
  ): Promise<User> {
    const user = await this.usersService.findOne(id)

    return this.usersService.updateUser({
      ...user,
      street: street,
      postalCode: postalCode,
      city: city,
      phone: phone,
      timesAvailable: timesAvailable
    })
  }

  @Get('teacher/available')
  @Roles(Role.ADMIN)
  async findAvailableTeachers(
    @Query('subject') subjectId: number,
  ): Promise<Teacher[]> {
    return this.usersService.findAvailableTeachers(subjectId)
  }
}
