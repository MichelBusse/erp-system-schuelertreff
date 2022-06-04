import { ChildEntity, Column } from 'typeorm'

import { Role } from 'src/auth/role.enum'

import { User } from './user.entity'

@ChildEntity()
export class SchoolCustomer extends User {
  role = Role.SCHOOLCUSTOMER

  @Column()
  schoolName: string
}
