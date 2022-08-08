import { Type } from 'class-transformer'
import { IsArray, IsOptional, ValidateNested } from 'class-validator'

import { Subject } from 'src/subjects/subject.entity'

import { TeacherState } from '../entities/teacher.entity'
import { TeacherSchoolType } from '../entities/user.entity'
import { UpdateUserDto } from './update-user.dto'

export class UpdateTeacherDto extends UpdateUserDto {
  @IsOptional()
  fee: number

  @IsOptional()
  @IsArray()
  schoolTypes: TeacherSchoolType[]

  @Type(() => Subject)
  @ValidateNested({ each: true })
  subjects: Subject[]

  @IsOptional()
  state: TeacherState
}
