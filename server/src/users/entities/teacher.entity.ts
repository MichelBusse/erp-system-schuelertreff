import { ChildEntity, Column, JoinTable, ManyToMany } from 'typeorm'

import { Role } from 'src/auth/role.enum'
import { Subject } from 'src/subjects/subject.entity'

import { User } from './user.entity'
import { ColumnCommonOptions } from 'typeorm/decorator/options/ColumnCommonOptions'

export enum TeacherState {
  APPLIED = 'applied',
  EMPLOYED = 'employed',
  SUSPENDED = 'suspended',
  QUIT = 'quit',
}

export enum Degree
{
  NOINFO = 'noinfo',
  HIGHSCHOOL = 'highschool',
  BACHELOR = 'bachelor',
  MASTER = 'master',
}


@ChildEntity()
export class Teacher extends User {
  role = Role.TEACHER

  //TODO: decimal value
  @Column()
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

  @ManyToMany(() => Subject)
  @JoinTable()
  subjects: Subject[]
}
