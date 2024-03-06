import { Type } from 'class-transformer'
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator'

import { SchoolType } from '../entities/user.entity'
import { TimeSlot } from '../models/TimeSlot'

/**
 * Schema for creating a class customer
 */ 
export class CreateClassCustomerDto {
  @IsNotEmpty()
  className: string

  @IsInt()
  school: number

  @IsArray()
  @Type(() => TimeSlot)
  @ValidateNested({ each: true })
  timesAvailable: TimeSlot[]

  @IsEnum(SchoolType)
  schoolType: SchoolType
}
