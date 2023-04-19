import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm'

import { Contract } from 'src/contracts/contract.entity'

export enum LessonState {
  IDLE = 'idle',
  HELD = 'held',
  CANCELLED = 'cancelled',
}

@Entity()
@Unique(['date', 'contract'])
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

  @ManyToOne(() => Contract, (contract) => contract.lessons, {
    onDelete: 'CASCADE',
  })
  contract: Contract

  @Column({ type: 'text', default: '' })
  notes: string
}
