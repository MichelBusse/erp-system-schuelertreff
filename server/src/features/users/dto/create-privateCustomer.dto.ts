import { Type } from 'class-transformer'
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator'

import { CreateUserDto } from './create-user.dto'
import { TimeSlot } from '../../../core/models/TimeSlot'
import SchoolType from 'src/core/enums/SchoolType.enum'

/**
 * Schema for creating a private customer
 */ 
export class CreatePrivateCustomerDto extends CreateUserDto {
  @IsNotEmpty()
  lastName: string

  @IsNotEmpty()
  firstName: string

  @IsArray()
  @Type(() => TimeSlot)
  @ValidateNested({ each: true })
  timesAvailable: TimeSlot[]

  @IsEnum(SchoolType)
  schoolType: SchoolType

  @IsInt()
  grade: number
}
