import { CreateUserDto } from './create-user.dto'

import { Salutation } from '../entities/user.entity'
import { IsNotEmpty } from 'class-validator'

export class CreatePrivateCustomerDto extends CreateUserDto {
  @IsNotEmpty()
  lastName: string

  @IsNotEmpty()
  firstName: string

  @IsNotEmpty()
  salutation: Salutation
}
