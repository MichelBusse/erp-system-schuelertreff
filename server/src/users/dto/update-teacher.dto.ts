import { Type } from 'class-transformer'
import { IsArray, IsMilitaryTime, IsOptional, IsRFC3339, ValidateNested } from 'class-validator'
import { IsTime24h } from 'src/IsTime24h.decorator'

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
