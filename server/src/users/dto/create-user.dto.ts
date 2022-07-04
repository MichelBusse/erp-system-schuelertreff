import { IsNotEmpty } from 'class-validator'

export abstract class CreateUserDto {
  @IsNotEmpty()
  street: string

  @IsNotEmpty()
  city: string

  @IsNotEmpty()
  postalCode: string

  @IsNotEmpty()
  email: string

  @IsNotEmpty()
  phone: string
}
