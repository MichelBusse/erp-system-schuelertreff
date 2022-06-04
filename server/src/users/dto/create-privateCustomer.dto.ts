import { IsNotEmpty } from 'class-validator'

import { Salutation } from '../entities/user.entity'
import { CreateUserDto } from './create-user.dto'

export class CreatePrivateCustomerDto extends CreateUserDto {
  @IsNotEmpty()
  lastName: string

  @IsNotEmpty()
  firstName: string

  @IsNotEmpty()
  salutation: Salutation
}
