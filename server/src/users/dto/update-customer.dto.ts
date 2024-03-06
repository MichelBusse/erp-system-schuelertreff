import { SchoolType } from '../entities/user.entity'
import { UpdateUserDto } from './update-user.dto'

/**
 * Schema for updating a customer
 */ 
export class UpdateCustomerDto extends UpdateUserDto {
  grade: number | null

  schoolType: SchoolType | null
}
