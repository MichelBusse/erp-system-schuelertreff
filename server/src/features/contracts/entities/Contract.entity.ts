import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { Customer } from 'src/features/users/entities/customer.entity'
import { Teacher } from 'src/features/users/entities/teacher.entity'
import ContractState from 'src/core/enums/ContractState.enum'
import { Subject } from 'src/features/subjects/entities/subject.entity'
import { Lesson } from 'src/features/lessons/entities/lesson.entity'
import ContractType from 'src/core/enums/ContractType.enum'


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

  @ManyToOne(() => Teacher, { nullable: true })
  teacher: Teacher | null

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
