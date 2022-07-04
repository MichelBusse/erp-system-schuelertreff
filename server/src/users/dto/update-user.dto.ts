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
  @IsNotEmpty()
  street: string

  @IsOptional()
  @IsNotEmpty()
  postalCode: string

  @IsOptional()
  @IsNotEmpty()
  city: string

  @IsOptional()
  @IsNotEmpty()
  phone: string

  @IsOptional()
  @IsArray()
  @Type(() => timeAvailable)
  @ValidateNested({ each: true })
  timesAvailable: timeAvailable[]
}
