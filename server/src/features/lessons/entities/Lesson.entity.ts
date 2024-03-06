import LessonState from 'src/core/enums/LessonState.enum'
import { Contract } from 'src/features/contracts/entities/Contract.entity'
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm'

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
