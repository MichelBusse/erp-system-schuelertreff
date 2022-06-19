import { ChildEntity, Column, JoinTable, ManyToMany } from 'typeorm'

import { Role } from 'src/auth/role.enum'
import { Subject } from 'src/subjects/subject.entity'

import { User } from './user.entity'

export enum TeacherState {
  APPLIED = 'applied',
  EMPLOYED = 'employed',
  SUSPENDED = 'suspended',
  QUIT = 'quit',
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

  @ManyToMany(() => Subject)
  @JoinTable()
  subjects: Subject[]
}
