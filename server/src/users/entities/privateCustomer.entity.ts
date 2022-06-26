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


  @Column({
    type: 'enum',
    enum: CustomerState,
    default: CustomerState.APPLIED
  })
  state: CustomerState

  @Column()
  grade: number
}
