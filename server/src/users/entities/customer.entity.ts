import { ChildEntity, Column } from 'typeorm'

import { SchoolType, User } from './user.entity'

@ChildEntity()
export abstract class Customer extends User {

  @Column()
  grade: number

  @Column({
    type: 'enum',
    enum: SchoolType,
    nullable: true
  })
  schoolType: SchoolType

}
