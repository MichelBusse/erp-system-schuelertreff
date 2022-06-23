import { Type } from 'class-transformer'
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator'

import { timeAvailable } from './timeAvailable'

export class UpdateUserDto {
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
