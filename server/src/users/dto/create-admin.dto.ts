import { IsNotEmpty } from 'class-validator'

import { CreateUserDto } from './create-user.dto'

export class CreateAdminDto extends CreateUserDto {
  @IsNotEmpty()
  lastName: string

  @IsNotEmpty()
  firstName: string
}
