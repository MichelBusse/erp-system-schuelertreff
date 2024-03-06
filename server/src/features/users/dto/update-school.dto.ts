import { IsNotEmpty, IsOptional } from 'class-validator'

import { UpdateUserDto } from './update-user.dto'
import SchoolType from 'src/core/enums/SchoolType.enum'

/**
 * Schema for updating a school
 */ 
export class UpdateSchoolDto extends UpdateUserDto {
  @IsNotEmpty()
  schoolName: string

  @IsOptional()
  schoolTypes: SchoolType[]
}
