import {
  Check,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  TableInheritance,
} from 'typeorm'

import { Role } from 'src/auth/role.enum'

import { Leave } from './leave.entity'

export enum TeacherSchoolType {
  GRUNDSCHULE = 'grundschule',
  OBERSCHULE = 'oberschule',
  GYMSEK1 = 'sek1',
  GYMSEK2 = 'sek2',
}

export enum SchoolType {
  GRUNDSCHULE = 'grundschule',
  OBERSCHULE = 'oberschule',
  GYMNASIUM = 'gymnasium',
  ANDERE = 'other',
}

export enum DeleteState {
  ACTIVE = 'active',
  DELETED = 'deleted',
}

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

  @Column({ nullable: true })
  street: string

  @Column({ nullable: true })
  city: string

  @Column({ nullable: true })
  postalCode: string

  //TODO: E-Mail validation
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
    default: `{${maxTimeRange}}`,
    nullable: false,
  })
  timesAvailable: string

  @Column({
    type: 'enum',
    enum: DeleteState,
    default: DeleteState.ACTIVE,
  })
  deleteState: DeleteState

  @OneToMany(() => Leave, (leave) => leave.user, {
    cascade: true,
    eager: true,
  })
  leave: Leave[]
}
