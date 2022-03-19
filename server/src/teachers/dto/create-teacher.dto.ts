import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Subject } from 'src/subjects/subject.entity';
import { Salutation } from 'src/user';

export class CreateTeacherDto {
  lastName: string;

  firstName: string;

  salutation: Salutation;

  street: string;

  city: string;

  postalCode: number;

  //TODO: E-Mail type?
  email: string;

  phone: string;

  fee: number;

  @Type(() => Subject)
  @ValidateNested({ each: true })
  subjects: Subject[];
}
