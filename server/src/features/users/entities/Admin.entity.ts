import { ChildEntity } from 'typeorm'

import { User } from './user.entity'
import UserRole from 'src/core/enums/UserRole.enum'

@ChildEntity()
export class Admin extends User {
  role = UserRole.ADMIN
}
