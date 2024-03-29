import { Type } from 'class-transformer'
import { IsArray, IsOptional, IsRFC3339, ValidateNested } from 'class-validator'

import { IsValidDate } from 'src/core/decorators/IsValidDate.decorator'

import { UpdateUserDto } from './update-user.dto'
import TeacherSchoolType from 'src/core/enums/TeacherSchoolType.enum'
import TeacherState from 'src/core/enums/TeacherState.enum'
import { Subject } from 'src/features/subjects/entities/subject.entity'

/**
 * Schema for updating a teacher
 */ 
export class UpdateTeacherDto extends UpdateUserDto {
  @IsOptional()
  fee: number

  @IsOptional()
  @IsArray()
  teacherSchoolTypes: TeacherSchoolType[]

  @IsOptional()
  @Type(() => Subject)
  @ValidateNested({ each: true })
  subjects: Subject[]

  @IsOptional()
  state: TeacherState

  @IsOptional()
  @IsValidDate()
  dateOfApplication: string | null

  @IsOptional()
  @IsValidDate()
  dateOfBirth: string | null

  @IsOptional()
  @IsRFC3339()
  dateOfApplicationMeeting: string | null

  @IsOptional()
  bankAccountOwner: string

  @IsOptional()
  bankInstitution: string

  @IsOptional()
  iban: string

  @IsOptional()
  bic: string
}
