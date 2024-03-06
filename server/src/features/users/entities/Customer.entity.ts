import { ChildEntity, Column } from 'typeorm'

import { User } from './user.entity'
import SchoolType from 'src/core/enums/SchoolType.enum'

@ChildEntity()
export abstract class Customer extends User {
  @Column()
  grade: number

  @Column({
    type: 'enum',
    enum: SchoolType,
    nullable: true,
  })
  schoolType: SchoolType
}
