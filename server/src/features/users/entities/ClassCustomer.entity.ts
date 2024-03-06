import { ChildEntity, Column, ManyToOne } from 'typeorm'

import { Customer } from './customer.entity'
import { School } from './school.entity'
import UserRole from 'src/core/enums/UserRole.enum'

@ChildEntity()
export class ClassCustomer extends Customer {
  role = UserRole.CLASSCUSTOMER

  @Column()
  className: string

  @ManyToOne(() => School)
  school: School

  @Column({ default: 'FALSE' })
  defaultClassCustomer: boolean
}
