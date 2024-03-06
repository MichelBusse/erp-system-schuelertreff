import { IsNotEmpty } from 'class-validator'

/**
 * Schema for creating a user
 */ 
export abstract class CreateUserDto {
  @IsNotEmpty()
  email: string
}
