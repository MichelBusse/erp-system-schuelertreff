import { ChildEntity, Column } from 'typeorm'

import { User } from './user.entity'

@ChildEntity()
export abstract class Customer extends User {
  @Column()
  grade: number
}
