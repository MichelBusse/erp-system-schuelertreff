import { ChildEntity, Column } from 'typeorm'

import { Role } from 'src/auth/role.enum'

import { Customer } from './customer.entity'

export enum CustomerState {
  APPLIED = 'applied',
  DELETED = 'deleted',
}

@ChildEntity()
export class PrivateCustomer extends Customer {
  role = Role.PRIVATECUSTOMER

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  fee: number

  @Column()
  grade: number
}
