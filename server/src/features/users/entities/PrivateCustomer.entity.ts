import { ChildEntity, Column } from 'typeorm'

import { Customer } from './customer.entity'
import UserRole from 'src/core/enums/UserRole.enum'

@ChildEntity()
export class PrivateCustomer extends Customer {
  role = UserRole.PRIVATECUSTOMER

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 30.0 })
  feeStandard: number

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 20.0 })
  feeOnline: number

  @Column({ type: 'text', default: '' })
  notes: string
}
