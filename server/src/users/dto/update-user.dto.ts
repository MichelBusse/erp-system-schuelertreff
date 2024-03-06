import { Type } from 'class-transformer'
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator'
import { TimeSlot } from '../models/TimeSlot'

/**
 * Schema for updating a user
 */ 
export class UpdateUserDto {
  @IsOptional()
  @IsNotEmpty()
  firstName: string

  @IsOptional()
  @IsNotEmpty()
  lastName: string

  @IsOptional()
  @IsNotEmpty()
  email: string

  @IsOptional()
  street: string

  @IsOptional()
  postalCode: string

  @IsOptional()
  city: string

  @IsOptional()
  phone: string

  @IsOptional()
  @IsArray()
  @Type(() => TimeSlot)
  @ValidateNested({ each: true })
  timesAvailable: TimeSlot[]
}
