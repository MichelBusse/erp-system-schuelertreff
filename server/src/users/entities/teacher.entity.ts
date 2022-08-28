import { ChildEntity, Column, JoinTable, ManyToMany } from 'typeorm'

import { Role } from 'src/auth/role.enum'
import { Subject } from 'src/subjects/subject.entity'

import { TeacherSchoolType, User } from './user.entity'

export enum TeacherState {
  CREATED = 'created',
  INTERVIEW = 'interview',
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
  teacherSchoolTypes: TeacherSchoolType[]

  @ManyToMany(() => Subject)
  @JoinTable()
  subjects: Subject[]

  @Column({
    type: 'date',
    nullable: true,
  })
  dateOfBirth: string

  @Column({
    type: 'date',
    nullable: true,
  })
  dateOfEmploymentStart: string

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


  @Column({
    type: 'date',
    nullable: true,
  })
  dateOfApplication: string

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  dateOfApplicationMeeting: string

  @Column({
    type: 'text',
    default: '',
  })
  applicationLocation: string
}
