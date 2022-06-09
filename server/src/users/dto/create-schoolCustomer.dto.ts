import { Type } from 'class-transformer'
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator'

import { CreateUserDto } from './create-user.dto'
import { timeAvailable } from './timeAvailable'

export class CreateSchoolCustomerDto extends CreateUserDto {
  @IsNotEmpty()
  schoolName: string

  @IsArray()
  @Type(() => timeAvailable)
  @ValidateNested({ each: true })
  timesAvailable: timeAvailable[]
}
