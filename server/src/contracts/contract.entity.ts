import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { Customer } from 'src/customers/customer.entity';
import { Teacher } from 'src/teachers/teacher.entity';
import { Subject } from 'src/subjects/subject.entity';

export enum Weekdays {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSTDAY = 'thurstday',
  FRIDAY = 'friday',
  SATURDAY = 'sturday',
  SUNDAY = 'sunday',
}

@Entity()
export class Contract {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => Customer, { cascade: true })
  @JoinTable()
  customers: Customer[];

  @ManyToOne(() => Teacher)
  teacher: Teacher;

  @ManyToOne(() => Subject)
  subject: Subject;

  @Column({
    type: 'enum',
    enum: Weekdays,
  })
  weekday: Weekdays;

  @Column({ type: 'time' })
  from: string;

  @Column({ type: 'time' })
  to: string;

  @Column({ type: 'timestamptz' })
  startDate: Date;

  @Column({ type: 'timestamptz' })
  endDate: Date;

  @Column()
  frequency: number;
}
