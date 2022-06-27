import { IsArray } from "class-validator"
import { SchoolType } from "../entities/user.entity"

export abstract class CreateUserDto {
  street: string

  city: string

  postalCode: string

  email: string

  phone: string

  @IsArray()
  schoolTypes: SchoolType[]
}
