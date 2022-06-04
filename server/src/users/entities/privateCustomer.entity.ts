import { ChildEntity, Column } from 'typeorm'

import { Role } from 'src/auth/role.enum'

import { User } from './user.entity'

@ChildEntity()
export class PrivateCustomer extends User {
  role = Role.PRIVATECUSTOMER
}
