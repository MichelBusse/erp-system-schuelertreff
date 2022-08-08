import { ChildEntity, Column, JoinTable, ManyToMany } from 'typeorm'

import { Role } from 'src/auth/role.enum'
import { Subject } from 'src/subjects/subject.entity'

import { TeacherSchoolType, User } from './user.entity'

export enum TeacherState {
  CREATED = 'created',
  APPLIED = 'applied',
  CONTRACT = 'contract',
  EMPLOYED = 'employed',
}

export enum Degree {
  NOINFO = 'noinfo',
  HIGHSCHOOL = 'highschool',
  BACHELOR = 'bachelor',
  MASTER = 'master',
}

@ChildEntity()
export class Teacher extends User {
  role = Role.TEACHER

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  fee: number

  @Column({
    type: 'enum',
    enum: TeacherState,
  })
  state: TeacherState

  @Column({
    type: 'enum',
    default: Degree.NOINFO,
    enum: Degree,
  })
  degree: Degree

  @Column({
    type: 'enum',
    enum: TeacherSchoolType,
    array: true,
    default: '{}',
  })
  schoolTypes: TeacherSchoolType[]

  @ManyToMany(() => Subject)
  @JoinTable()
  subjects: Subject[]

  @Column({
    type: 'date',
    nullable: true,
  })
  dateOfBirth: Date

  @Column({
    type: 'date',
    nullable: true,
  })
  dateOfEmploymentStart: Date

  @Column({
    type: 'text',
    default: '',
  })
  bankAccountOwner: string

  @Column({
    type: 'text',
    default: '',
  })
  bankInstitution: string

  @Column({
    type: 'text',
    default: '',
  })
  iban: string

  @Column({
    type: 'text',
    default: '',
  })
  bic: string
}
