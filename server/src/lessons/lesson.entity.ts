import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { Contract } from 'src/contracts/contract.entity'
import { Teacher } from 'src/users/entities/teacher.entity'

export enum LessonState {
  HELD = 'held',
  POSTPONED = 'postponed',
}

@Entity()
export class Lesson {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'timestamptz' })
  date: Date

  @Column({
    type: 'enum',
    enum: LessonState,
  })
  state: LessonState

  @ManyToOne(() => Teacher)
  teacher: Teacher

  @ManyToOne(() => Contract)
  contract: Contract
}
