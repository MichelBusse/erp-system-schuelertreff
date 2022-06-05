import { ChildEntity, Column } from 'typeorm'

import { Role } from 'src/auth/role.enum'

import { Customer } from './customer.entity'

@ChildEntity()
export class SchoolCustomer extends Customer {
  role = Role.SCHOOLCUSTOMER

  @Column()
  schoolName: string
}
