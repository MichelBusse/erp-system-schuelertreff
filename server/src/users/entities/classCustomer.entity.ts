import { ChildEntity, Column, ManyToOne } from 'typeorm'



import { Role } from 'src/auth/role.enum'

import { Customer } from './customer.entity'
import { SchoolCustomer } from './schoolCustomer.entity'

@ChildEntity()
export class ClassCustomer extends Customer {
  role = Role.CLASS

  @Column()
  className: string

  @Column()
  numberOfStudents: number

  @ManyToOne(() => SchoolCustomer)
  schoolCustomer: SchoolCustomer
}