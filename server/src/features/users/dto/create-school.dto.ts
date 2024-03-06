import { IsArray, IsNotEmpty, IsOptional } from 'class-validator'

import { CreateUserDto } from './create-user.dto'
import SchoolType from 'src/core/enums/SchoolType.enum'

/**
 * Schema for creating a school
 */ 
export class CreateSchoolDto extends CreateUserDto {
  @IsNotEmpty()
  schoolName: string

  @IsOptional()
  @IsArray()
  schoolTypes?: SchoolType[]
}
