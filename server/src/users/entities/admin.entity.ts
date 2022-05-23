import { ChildEntity } from 'typeorm'

import { Role } from 'src/auth/role.enum'

import { User } from './user.entity'

@ChildEntity()
export class Admin extends User {
  role = Role.ADMIN
}
