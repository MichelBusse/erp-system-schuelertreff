import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { Subject } from 'src/subjects/subject.entity'
import { Customer } from 'src/users/entities/customer.entity'
import { Teacher } from 'src/users/entities/teacher.entity'

export enum ContractState {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
}

@Entity()
export class Contract {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    type: 'enum',
    enum: ContractState,
    default: ContractState.PENDING,
  })
  state: ContractState

  @ManyToMany(() => Customer)
  @JoinTable()
  customers: Customer[]

  @ManyToOne(() => Teacher)
  teacher: Teacher

  @ManyToOne(() => Subject)
  subject: Subject

  @Column({ type: 'time' })
  startTime: string

  @Column({ type: 'time' })
  endTime: string

  @Column({ type: 'date' })
  startDate: string

  @Column({ type: 'date', nullable: true })
  endDate: string

  @Column()
  interval: number
}
