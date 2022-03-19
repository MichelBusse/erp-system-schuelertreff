import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { Customer } from './customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customersRepository: Repository<Customer>,
  ) {}

  create(createUserDto: CreateCustomerDto): Promise<Customer> {
    const customer = new Customer();
    customer.lastName = createUserDto.lastName;
    customer.firstName = createUserDto.firstName;
    customer.salutation = createUserDto.salutation;
    customer.street = createUserDto.street;
    customer.city = createUserDto.city;
    customer.postalCode = createUserDto.postalCode;
    customer.email = createUserDto.email;
    customer.phone = createUserDto.phone;

    return this.customersRepository.save(customer);
  }

  async findAll(): Promise<Customer[]> {
    return this.customersRepository.find();
  }

  findOne(id: string): Promise<Customer> {
    return this.customersRepository.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.customersRepository.delete(id);
  }
}
