import { Contract } from 'src/contracts/contract.entity';
import { Teacher } from 'src/users/teacher.entity';
import { LessonState } from '../lesson.entity';

export class CreateLessonDto {
  date: Date;

  state: LessonState;

  contract: Contract;

  teacher: Teacher;
}
