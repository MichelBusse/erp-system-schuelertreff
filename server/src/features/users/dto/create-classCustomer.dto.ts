import { Type } from 'class-transformer'
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator'

import { TimeSlot } from '../../../core/models/TimeSlot'
import SchoolType from 'src/core/enums/SchoolType.enum'

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
