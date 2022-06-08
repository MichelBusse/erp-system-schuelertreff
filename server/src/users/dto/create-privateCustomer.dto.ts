import { Type } from 'class-transformer'
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator'

import { Salutation } from '../entities/user.entity'
import { CreateUserDto } from './create-user.dto'
import { timeAvailable } from './timeAvailable'

export class CreatePrivateCustomerDto extends CreateUserDto {
  @IsNotEmpty()
  lastName: string

  @IsNotEmpty()
  firstName: string

  @IsNotEmpty()
  salutation: Salutation

  @IsArray()
  @Type(() => timeAvailable)
  @ValidateNested({ each: true })
  timesAvailable: timeAvailable[]
}
