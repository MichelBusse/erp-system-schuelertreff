import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common'

import { AuthService } from 'src/auth/auth.service'
import { Public } from 'src/auth/decorators/public.decorator'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { Role } from 'src/auth/role.enum'

import { CreateAdminDto } from './dto/create-admin.dto'
import { CreateCustomerDto } from './dto/create-customer.dto'
import { CreateTeacherDto } from './dto/create-teacher.dto'
import { Admin, Customer, Teacher, User } from './entities'
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

  @Get('customer')
  findAllCustomers(): Promise<Customer[]> {
    return this.usersService.findAllCustomers()
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

  @Post('customer')
  @Roles(Role.ADMIN)
  async createCustomer(@Body() dto: CreateCustomerDto): Promise<Customer> {
    return this.usersService.createCustomer(dto)
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
