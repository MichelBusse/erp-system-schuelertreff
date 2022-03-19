import { Subject } from 'src/subjects/subject.entity';
import { User } from 'src/user';
import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';

export enum TeacherState {
  APPLIED = 'applied',
  EMPLOYED = 'employed',
  SUSPENDED = 'suspended',
  QUIT = 'quit',
}

@Entity()
export class Teacher extends User {
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

  //TODO: Password Column
}
