import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';
import { Customer } from './customer.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { Teacher, TeacherState } from './teacher.entity';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Teacher)
    private readonly teachersRepository: Repository<Teacher>,

    @InjectRepository(Customer)
    private readonly customersRepository: Repository<Customer>,

    @InjectRepository(Admin)
    private readonly adminsRepository: Repository<Admin>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['subjects'],
    });
  }

  async findAllCustomers(): Promise<Customer[]> {
    return this.customersRepository.find();
  }

  async findAllTeachers(): Promise<Teacher[]> {
    return this.teachersRepository.find({
      relations: ['subjects'],
    });
  }

  findOne(id: string): Promise<User> {
    return this.usersRepository.findOne(id);
  }

  findOneByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({
      where: { email: email },
    });
  }

  findOneCustomer(id: string): Promise<Customer> {
    return this.customersRepository.findOne(id);
  }

  findOneTeacher(id: string): Promise<Teacher> {
    return this.teachersRepository.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  createCustomer(dto: CreateCustomerDto): Promise<Customer> {
    const customer = this.customersRepository.create({
      lastName: dto.lastName,
      firstName: dto.firstName,
      salutation: dto.salutation,
      street: dto.street,
      city: dto.city,
      postalCode: dto.postalCode,
      email: dto.email,
      phone: dto.phone,
    });

    return this.customersRepository.save(customer);
  }

  createTeacher(dto: CreateTeacherDto): Promise<Teacher> {
    const teacher = this.teachersRepository.create({
      lastName: dto.lastName,
      firstName: dto.firstName,
      salutation: dto.salutation,
      street: dto.street,
      city: dto.city,
      postalCode: dto.postalCode,
      email: dto.email,
      phone: dto.phone,
      fee: dto.fee,
      state: TeacherState.APPLIED,
      subjects: dto.subjects,
    });

    return this.teachersRepository.save(teacher);
  }

  createAdmin(dto: CreateAdminDto): Promise<Admin> {
    const admin = this.adminsRepository.create({
      lastName: dto.lastName,
      firstName: dto.firstName,
      salutation: dto.salutation,
      street: dto.street,
      city: dto.city,
      postalCode: dto.postalCode,
      email: dto.email,
      phone: dto.phone,
    });

    return this.adminsRepository.save(admin);
  }
}
