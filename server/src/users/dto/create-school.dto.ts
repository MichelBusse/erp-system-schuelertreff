import { IsNotEmpty } from 'class-validator'

import { CreateUserDto } from './create-user.dto'

export class CreateSchoolDto extends CreateUserDto {
  @IsNotEmpty()
  schoolName: string
}
