import { Type } from 'class-transformer'
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator'

import { SchoolType } from '../entities/user.entity'
import { timeAvailable } from './timeAvailable'

export class CreateClassCustomerDto {
  @IsNotEmpty()
  className: string

  @IsInt()
  school: number

  @IsArray()
  @Type(() => timeAvailable)
  @ValidateNested({ each: true })
  timesAvailable: timeAvailable[]

  @IsEnum(SchoolType)
  schoolType: SchoolType
}
