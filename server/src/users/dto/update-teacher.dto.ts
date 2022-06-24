import { Type } from 'class-transformer'
import { IsArray, ValidateNested } from 'class-validator'
import { Subject } from 'src/subjects/subject.entity'
import { SchoolType } from '../entities/user.entity'
import { UpdateUserDto } from './update-user.dto'

export class UpdateTeacherDto extends UpdateUserDto{
  fee: number

  schoolTypes: SchoolType[]

  @Type(() => Subject)
  @ValidateNested({ each: true })
  subjects: Subject[]

}
