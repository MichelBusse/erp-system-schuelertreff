import { Type } from 'class-transformer'
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator'

import { timeAvailable } from './timeAvailable'

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
  @Type(() => timeAvailable)
  @ValidateNested({ each: true })
  timesAvailable: timeAvailable[]
}
