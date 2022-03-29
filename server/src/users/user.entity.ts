import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  TableInheritance,
} from 'typeorm';

export enum Salutation {
  FRAU = 'Frau',
  HERR = 'Herr',
}

export enum Role {
  CUSTOMER = 'customer',
  TEACHER = 'teacher',
}

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class User {
  role: Role;

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  lastName: string;

  @Column()
  firstName: string;

  @Column({
    type: 'enum',
    enum: Salutation,
  })
  salutation: Salutation;

  @Column()
  street: string;

  @Column()
  city: string;

  @Column()
  postalCode: string;

  //TODO: E-Mail validation
  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;
}
