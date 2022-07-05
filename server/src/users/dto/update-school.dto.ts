import { IsNotEmpty } from 'class-validator'

import { UpdateUserDto } from './update-user.dto'

export class UpdateSchoolDto extends UpdateUserDto {
  @IsNotEmpty()
  schoolName: string
}
