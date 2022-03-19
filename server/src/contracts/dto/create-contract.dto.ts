import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Weekdays } from '../contract.entity';
import { Teacher } from 'src/teachers/teacher.entity';
import { Customer } from 'src/customers/customer.entity';
import { Subject } from 'src/subjects/subject.entity';

export class CreateContractDto {
  //TODO:

  @Type(() => Customer)
  @ValidateNested({ each: true })
  customers: Customer[];

  teacher: Teacher;

  subject: Subject;

  weekday: Weekdays;

  from: string;

  to: string;

  startDate: Date;

  endDate: Date;

  frequency: number;
}
