import {
  Check,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  TableInheritance,
} from 'typeorm'

import { Role } from 'src/auth/role.enum'

// the week of 2001-01-01 is used as dummy, DOW and time is important here
export const maxTimeRange = '[2001-01-01 00:00, 2001-01-08 00:00)'

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
@Check(`"timesAvailable" <@ '${maxTimeRange}'::tstzrange`)
export abstract class User {
  role: Role

  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: true })
  lastName: string

  @Column({ nullable: true })
  firstName: string

  @Column()
  street: string

  @Column()
  city: string

  @Column()
  postalCode: string

  //TODO: E-Mail validation
  @Column({ unique: true })
  email: string

  @Column()
  phone: string

  @Column({ select: false, nullable: true })
  passwordHash?: string

  @Column({ select: false })
  mayAuthenticate: boolean

  @Column({ type: 'timestamptz', default: new Date(0) })
  jwtValidAfter: Date

  @Column({
    type: 'tstzmultirange',
    default: `{${maxTimeRange}}`,
    nullable: false,
  })
  timesAvailable: string
}
