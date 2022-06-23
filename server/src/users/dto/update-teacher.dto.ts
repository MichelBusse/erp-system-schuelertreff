import { Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { Subject } from 'src/subjects/subject.entity'
import { UpdateUserDto } from './update-user.dto'

export class UpdateTeacherDto extends UpdateUserDto{
  fee: number

  @Type(() => Subject)
  @ValidateNested({ each: true })
  subjects: Subject[]

}
