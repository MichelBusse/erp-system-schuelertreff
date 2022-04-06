import { Subject } from 'src/subjects/subject.entity';
import { Role, User } from './user.entity';
import { ChildEntity, Column, ManyToMany, JoinTable } from 'typeorm';

export enum TeacherState {
  APPLIED = 'applied',
  EMPLOYED = 'employed',
  SUSPENDED = 'suspended',
  QUIT = 'quit',
}

@ChildEntity()
export class Teacher extends User {
  role = Role.TEACHER;

  //TODO: decimal value
  @Column()
  fee: number;

  @Column({
    type: 'enum',
    enum: TeacherState,
  })
  state: TeacherState;

  @ManyToMany(() => Subject, { cascade: true })
  @JoinTable()
  subjects: Subject[];
}
