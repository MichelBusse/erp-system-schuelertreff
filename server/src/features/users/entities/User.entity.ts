import UserDeleteState from 'src/core/enums/UserDeleteState.enum'
import UserRole from 'src/core/enums/UserRole.enum'
import {
  Check,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  TableInheritance,
} from 'typeorm'
import { Leave } from './Leave'
import { MAX_TIME_RANGE } from 'src/core/res/Constants'

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
@Check(`"timesAvailable" <@ '${MAX_TIME_RANGE}'::tstzrange`)
export abstract class User {
  role: UserRole

  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: true })
  lastName: string

  @Column({ nullable: true })
  firstName: string

  @Column({ nullable: true })
  street: string

  @Column({ nullable: true })
  city: string

  @Column({ nullable: true })
  postalCode: string

  @Column({ unique: true, nullable: true })
  email: string

  @Column({ nullable: true })
  phone: string

  @Column({ select: false, nullable: true })
  passwordHash?: string

  @Column({ select: false, default: false })
  mayAuthenticate: boolean

  @Column({
    type: 'timestamptz',
    default: new Date(0),
  })
  jwtValidAfter: Date

  @Column({
    type: 'tstzmultirange',
    default: `{${MAX_TIME_RANGE}}`,
    nullable: false,
  })
  timesAvailable: string

  @Column({
    type: 'enum',
    enum: UserDeleteState,
    default: UserDeleteState.ACTIVE,
  })
  deleteState: UserDeleteState

  @OneToMany(() => Leave, (leave) => leave.user, {
    cascade: true,
    eager: true,
  })
  leave: Leave[]
}
