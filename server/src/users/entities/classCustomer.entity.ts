import { ChildEntity, Column, ManyToOne } from 'typeorm'

import { Role } from 'src/auth/role.enum'

import { Customer } from './customer.entity'
import { School } from './school.entity'
import { SchoolType } from './user.entity'

@ChildEntity()
export class ClassCustomer extends Customer {
  role = Role.CLASSCUSTOMER

  @Column()
  className: string

  @ManyToOne(() => School)
  school: School

}
