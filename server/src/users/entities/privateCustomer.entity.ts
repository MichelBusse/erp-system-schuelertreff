import { ChildEntity } from 'typeorm'

import { Role } from 'src/auth/role.enum'

import { Customer } from './customer.entity'

@ChildEntity()
export class PrivateCustomer extends Customer {
  role = Role.PRIVATECUSTOMER
}
