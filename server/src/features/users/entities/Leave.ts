import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import LeaveType from 'src/core/enums/LeaveType.enum'
import LeaveState from 'src/core/enums/LeaveState.enum'
import { User } from 'src/features/users/entities/user.entity'

@Entity('user_leave')
export class Leave {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({
    type: 'enum',
    enum: LeaveType,
  })
  type: LeaveType

  @Column({
    type: 'enum',
    enum: LeaveState,
    default: LeaveState.PENDING,
  })
  state?: LeaveState

  @Column({ type: 'date' })
  startDate: string

  @Column({ type: 'date' })
  endDate: string

  @ManyToOne(() => User, (user) => user.leave, {
    onDelete: 'CASCADE',
  })
  user?: User

  @Column({ type: 'bytea', nullable: true, select: false })
  attachment?: Buffer

  @Column({
    generatedType: 'STORED',
    asExpression: `attachment IS NOT NULL`,
  })
  hasAttachment?: boolean
}
