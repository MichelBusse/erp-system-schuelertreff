import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common'

import { AuthService } from 'src/auth/auth.service'
import { Public } from 'src/auth/decorators/public.decorator'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { Role } from 'src/auth/role.enum'

import { CreateAdminDto } from './dto/create-admin.dto'
import { CreatePrivateCustomerDto } from './dto/create-privateCustomer.dto'
import { CreateSchoolCustomerDto } from './dto/create-schoolCustomer.dto'
import { CreateTeacherDto } from './dto/create-teacher.dto'
import {
  Admin,
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

  //TODO: this is public for development only!
  @Public()
  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll()
  }

  // TODO: Remove public
  @Public()
  @Get('privateCustomer')
  findAllPrivateCustomers(): Promise<PrivateCustomer[]> {
    return this.usersService.findAllPrivateCustomers()
  }

  // TODO: Remove public
  @Public()
  @Get('schoolCustomer')
  findAllSchoolCustomers(): Promise<SchoolCustomer[]> {
    return this.usersService.findAllSchoolCustomers()
  }

  // TODO: Remove public
  @Public()
  @Get('teacher')
  findAllTeachers(): Promise<Teacher[]> {
    return this.usersService.findAllTeachers()
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

  // TODO: Remove public
  @Public()
  @Post('privateCustomer')
  // TODO: remove commentate
  //@Roles(Role.ADMIN)
  async createPrivateCustomer(
    @Body() dto: CreatePrivateCustomerDto,
  ): Promise<PrivateCustomer> {
    return this.usersService.createPrivateCustomer(dto)
  }

  // TODO: Remove public
  @Public()
  @Post('schoolCustomer')
  // TODO: remove commentate
  //@Roles(Role.ADMIN)
  async createSchoolCustomer(
    @Body() dto: CreateSchoolCustomerDto,
  ): Promise<SchoolCustomer> {
    return this.usersService.createSchoolCustomer(dto)
  }

  // TODO: Remove Public
  @Public()
  @Post('teacher')
  // @Roles(Role.ADMIN)
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
}
