import { ChildEntity, Column, ManyToOne, OneToMany } from 'typeorm'

import { Role } from 'src/auth/role.enum'

import { Customer } from './customer.entity'
import { School } from './school.entity'

@ChildEntity()
export class ClassCustomer extends Customer {
  role = Role.CLASSCUSTOMER

  @Column()
  className: string

  @Column()
  numberOfStudents: number

  @ManyToOne(() => School)
  school: School
}
