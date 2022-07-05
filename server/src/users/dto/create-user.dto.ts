import { IsArray, IsNotEmpty, IsOptional } from 'class-validator'

import { SchoolType } from '../entities/user.entity'

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

  @IsOptional()
  @IsArray()
  schoolTypes?: SchoolType[]
}
