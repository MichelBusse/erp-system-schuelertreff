import { MinLength } from 'class-validator'

/**
 * Schema for resetting a password
 */ 
export class ResetPasswordDto {
  token: string

  @MinLength(8)
  password: string
}
