import { IsNotEmpty, IsOptional } from 'class-validator'

import { SchoolType } from '../entities/user.entity'
import { UpdateUserDto } from './update-user.dto'

/**
 * Schema for updating a school
 */ 
export class UpdateSchoolDto extends UpdateUserDto {
  @IsNotEmpty()
  schoolName: string

  @IsOptional()
  schoolTypes: SchoolType[]
}
