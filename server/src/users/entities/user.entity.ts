import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  TableInheritance,
} from 'typeorm'

import { Role } from 'src/auth/role.enum'

export enum Salutation {
  FRAU = 'Frau',
  HERR = 'Herr',
  DIVERS = 'divers',
}

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class User {
  role: Role

  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: true })
  lastName: string

  @Column({ nullable: true })
  firstName: string

  @Column({
    type: 'enum',
    enum: Salutation,
    nullable: true,
  })
  salutation: Salutation

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
}
