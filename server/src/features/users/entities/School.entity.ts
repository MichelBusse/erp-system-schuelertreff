import { ChildEntity, Column } from 'typeorm'
import { User } from './user.entity'
import UserRole from 'src/core/enums/UserRole.enum'
import SchoolState from 'src/core/enums/SchoolState.enum'
import SchoolType from 'src/core/enums/SchoolType.enum'

@ChildEntity()
export class School extends User {
  role = UserRole.SCHOOL

  @Column({
    type: 'enum',
    default: SchoolState.CREATED,
    enum: SchoolState,
  })
  schoolState: SchoolState

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
