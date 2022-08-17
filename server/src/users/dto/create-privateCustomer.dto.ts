import { Type } from 'class-transformer'
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator'

import { SchoolType } from '../entities/user.entity'
import { CreateUserDto } from './create-user.dto'
import { timeAvailable } from './timeAvailable'

export class CreatePrivateCustomerDto extends CreateUserDto {
  @IsNotEmpty()
  lastName: string

  @IsNotEmpty()
  firstName: string

  @IsArray()
  @Type(() => timeAvailable)
  @ValidateNested({ each: true })
  timesAvailable: timeAvailable[]

  @IsEnum(SchoolType)
  schoolType: SchoolType

  @IsInt()
  grade: number
}
