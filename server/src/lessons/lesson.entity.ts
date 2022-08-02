import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { Contract } from 'src/contracts/contract.entity'

export enum LessonState {
  IDLE = 'idle',
  HELD = 'held',
  CANCELLED = 'cancelled',
}

@Entity()
export class Lesson {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'date' })
  date: string

  @Column({
    type: 'enum',
    enum: LessonState,
    default: LessonState.IDLE,
  })
  state: LessonState

  @ManyToOne(() => Contract, (contract) => contract.lessons)
  contract: Contract
}
