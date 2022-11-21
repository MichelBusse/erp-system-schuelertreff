import { IsArray, IsNotEmpty, IsOptional } from 'class-validator'

import { SchoolType } from '../entities/user.entity'
import { CreateUserDto } from './create-user.dto'

export class CreateSchoolDto extends CreateUserDto {
  @IsNotEmpty()
  schoolName: string

  @IsOptional()
  @IsArray()
  schoolTypes?: SchoolType[]
}
