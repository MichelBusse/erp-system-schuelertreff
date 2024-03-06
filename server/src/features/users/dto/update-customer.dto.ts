import SchoolType from 'src/core/enums/SchoolType.enum'
import { UpdateUserDto } from './update-user.dto'

/**
 * Schema for updating a customer
 */ 
export class UpdateCustomerDto extends UpdateUserDto {
  grade: number | null

  schoolType: SchoolType | null
}
