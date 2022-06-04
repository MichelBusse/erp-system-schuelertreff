import { IsNotEmpty } from 'class-validator'
import { CreateUserDto } from './create-user.dto'

export class CreateSchoolCustomerDto extends CreateUserDto {

  @IsNotEmpty()
  schoolName: string
}
