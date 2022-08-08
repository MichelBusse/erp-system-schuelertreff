import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { Lesson } from 'src/lessons/lesson.entity'
import { Subject } from 'src/subjects/subject.entity'
import { Customer } from 'src/users/entities/customer.entity'
import { Teacher } from 'src/users/entities/teacher.entity'

export enum ContractState {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
}

export enum ContractType {
  STANDARD = 'standard',
  ONLINE = 'online',
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

  @ManyToOne(() => Contract, (contract) => contract.childContracts, {
    nullable: true,
  })
  parentContract: Contract

  @OneToMany(() => Contract, (contract) => contract.parentContract)
  childContracts: Contract[]

  @OneToMany(() => Lesson, (lesson) => lesson.contract)
  lessons: Lesson[]

  @Column({
    type: 'enum',
    enum: ContractType,
    default: ContractType.STANDARD,
  })
  contractType: ContractType
}
