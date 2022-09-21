import { IsNotEmpty } from 'class-validator'

export abstract class CreateUserDto {
  @IsNotEmpty()
  email: string
}
