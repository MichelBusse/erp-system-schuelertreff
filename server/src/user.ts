import { Column, PrimaryGeneratedColumn } from 'typeorm';

export enum Salutation {
  FRAU = 'Frau',
  HERR = 'Herr',
}

export abstract class User {
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
  postalCode: number;

  //TODO: E-Mail validation
  @Column()
  email: string;

  @Column()
  phone: string;
}
