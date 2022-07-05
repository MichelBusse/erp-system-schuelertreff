import { ChildEntity, Column, JoinTable, ManyToMany } from 'typeorm'

import { Role } from 'src/auth/role.enum'
import { Subject } from 'src/subjects/subject.entity'

import { SchoolType, User } from './user.entity'

export enum TeacherState {
  CREATED = 'created',
  APPLIED = 'applied',
  EMPLOYED = 'employed',
  SUSPENDED = 'suspended',
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

  //TODO: decimal value
  @Column({ nullable: true })
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
    enum: SchoolType,
    array: true,
    default: '{}',
  })
  schoolTypes: SchoolType[]

  @ManyToMany(() => Subject)
  @JoinTable()
  subjects: Subject[]
}
