import { UpdateUserDto } from './update-user.dto'

export class UpdateClassCustomerDto extends UpdateUserDto {
  className: string

  numberOfStudents: number
}
