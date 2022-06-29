import { Type } from 'class-transformer'
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator'

import { Salutation } from '../entities/user.entity'
import { timeAvailable } from './timeAvailable'

export class UpdateUserDto {
  @IsNotEmpty()
  firstName: string

  @IsNotEmpty()
  lastName: string

  @IsNotEmpty()
  salutation: Salutation

  @IsNotEmpty()
  email: string

  @IsNotEmpty()
  street: string

  @IsNotEmpty()
  postalCode: string

  @IsNotEmpty()
  city: string

  @IsNotEmpty()
  phone: string

  @IsArray()
  @Type(() => timeAvailable)
  @ValidateNested({ each: true })
  timesAvailable: timeAvailable[]
}
