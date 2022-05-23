import { Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'

import { Subject } from 'src/subjects/subject.entity'

import { CreateUserDto } from './create-user.dto'

export class CreateTeacherDto extends CreateUserDto {
  fee: number

  @Type(() => Subject)
  @ValidateNested({ each: true })
  subjects: Subject[]
}
