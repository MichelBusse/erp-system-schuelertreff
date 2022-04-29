import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { UsersService } from './users.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { User, Admin, Customer, Teacher } from './entities';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/role.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //TODO: this is public for development only!
  @Public()
  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get('customer')
  findAllCustomers(): Promise<Customer[]> {
    return this.usersService.findAllCustomers();
  }

  @Get('teacher')
  findAllTeachers(): Promise<Teacher[]> {
    return this.usersService.findAllTeachers();
  }


  @Get(':id')
  findOne(@Param('id') id: number): Promise<User> {
    return this.usersService.findOne(id);
  }


  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: number): Promise<void> {
    return this.usersService.remove(id);
  }


  @Post('customer')
  @Roles(Role.ADMIN)
  createCustomer(@Body() dto: CreateCustomerDto): Promise<Customer> {
    return this.usersService.createCustomer(dto);
  }

  @Post('teacher')
  @Roles(Role.ADMIN)
  createTeacher(@Body() dto: CreateTeacherDto): Promise<Teacher> {
    return this.usersService.createTeacher(dto);
  }

  @Post('admin')
  @Roles(Role.ADMIN)
  createAdmin(@Body() dto: CreateAdminDto): Promise<Admin> {
    return this.usersService.createAdmin(dto);
  }
}
