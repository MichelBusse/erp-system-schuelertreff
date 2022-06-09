import { Type } from 'class-transformer'
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator'

import { Subject } from 'src/subjects/subject.entity'

import { Salutation } from '../entities/user.entity'
import { CreateUserDto } from './create-user.dto'
import { timeAvailable } from './timeAvailable'

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

  @IsArray()
  @Type(() => timeAvailable)
  @ValidateNested({ each: true })
  timesAvailable: timeAvailable[]
}
