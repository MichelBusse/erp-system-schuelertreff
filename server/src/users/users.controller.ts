import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { Customer } from './customer.entity';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Teacher } from './teacher.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { Public } from 'src/auth/public.decorator';

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
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }


  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }


  @Post('customer')
  createCustomer(@Body() dto: CreateCustomerDto): Promise<Customer> {
    return this.usersService.createCustomer(dto);
  }

  @Post('teacher')
  createTeacher(@Body() dto: CreateTeacherDto): Promise<Teacher> {
    return this.usersService.createTeacher(dto);
  }
}
