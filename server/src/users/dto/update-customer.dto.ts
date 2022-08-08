import { SchoolType } from '../entities/user.entity'
import { UpdateUserDto } from './update-user.dto'

export class UpdateCustomerDto extends UpdateUserDto {
  grade: number | null

  schoolType: SchoolType | null
}
