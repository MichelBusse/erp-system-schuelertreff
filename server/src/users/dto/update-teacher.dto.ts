import { Type } from 'class-transformer'
import { IsArray, IsOptional, ValidateNested } from 'class-validator'

import { IsValidDate } from 'src/IsValidDate.decorator'
import { Subject } from 'src/subjects/subject.entity'

import { TeacherState } from '../entities/teacher.entity'
import { TeacherSchoolType } from '../entities/user.entity'
import { UpdateUserDto } from './update-user.dto'

export class UpdateTeacherDto extends UpdateUserDto {
  @IsOptional()
  fee: number

  @IsOptional()
  @IsArray()
  teacherSchoolTypes: TeacherSchoolType[]

  @Type(() => Subject)
  @ValidateNested({ each: true })
  subjects: Subject[]

  @IsOptional()
  state: TeacherState

  @IsOptional()
  @IsValidDate()
  dateOfApplication?: string

  @IsOptional()
  @IsValidDate()
  dateOfBirth: string

  bankAccountOwner: string
  bankInstitution: string
  iban: string
  bic: string
}
