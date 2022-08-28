import { ChildEntity, Column } from 'typeorm'

import { Role } from 'src/auth/role.enum'

import { SchoolType, User } from './user.entity'

@ChildEntity()
export class School extends User {
  role = Role.SCHOOL

  @Column()
  schoolName: string

  @Column({
    type: 'enum',
    enum: SchoolType,
    array: true,
    default: '{}',
  })
  schoolTypes: SchoolType[]

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 30.0 })
  feeStandard: number

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 20.0 })
  feeOnline: number

  @Column({ type: 'text', default: '' })
  notes: string

  @Column({
    type: 'date',
    nullable: true,
  })
  dateOfStart: Date
}
