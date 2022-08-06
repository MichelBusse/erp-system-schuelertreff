import { IsInt, Max, Min } from 'class-validator'

import { UpdateUserDto } from './update-user.dto'

export class UpdatePrivateCustomerDto extends UpdateUserDto {
  @IsInt()
  @Min(1)
  @Max(13)
  grade: number
}
