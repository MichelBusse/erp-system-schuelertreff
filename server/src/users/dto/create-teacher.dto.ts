import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Subject } from 'src/subjects/subject.entity';
import { CreateUserDto } from './create-user.dto';

export class CreateTeacherDto extends CreateUserDto {
  password: string;

  fee: number;

  @Type(() => Subject)
  @ValidateNested({ each: true })
  subjects: Subject[];
}
