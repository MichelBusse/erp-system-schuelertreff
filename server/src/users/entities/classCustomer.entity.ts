import { ChildEntity, Column, ManyToOne } from 'typeorm'

import { Role } from 'src/auth/role.enum'

import { Customer } from './customer.entity'
import { School } from './school.entity'

@ChildEntity()
export class ClassCustomer extends Customer {
  role = Role.CLASSCUSTOMER

  @Column()
  className: string

  @ManyToOne(() => School)
  school: School

  @Column({ default: 'FALSE' })
  defaultClassCustomer: boolean
}
