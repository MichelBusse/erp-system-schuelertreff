import { Type } from 'class-transformer'
import { IsNotEmpty, ValidateNested } from 'class-validator'

import { Subject } from 'src/subjects/subject.entity'

import { Salutation } from '../entities/user.entity'
import { CreateUserDto } from './create-user.dto'

export class CreateTeacherDto extends CreateUserDto {
  @IsNotEmpty()
  lastName: string

  @IsNotEmpty()
  firstName: string

  @IsNotEmpty()
  salutation: Salutation

  fee: number

  @Type(() => Subject)
  @ValidateNested({ each: true })
  subjects: Subject[]
}
