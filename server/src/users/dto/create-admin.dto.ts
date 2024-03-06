import { IsNotEmpty } from 'class-validator'

import { CreateUserDto } from './create-user.dto'

/**
 * Schema for creating an admin user
 */ 
export class CreateAdminDto extends CreateUserDto {
  @IsNotEmpty()
  lastName: string

  @IsNotEmpty()
  firstName: string
}
