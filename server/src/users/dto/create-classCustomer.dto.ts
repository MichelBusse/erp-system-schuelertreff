import { Type } from 'class-transformer'
import { IsArray, IsInt, IsNotEmpty, ValidateNested } from 'class-validator'

import { timeAvailable } from './timeAvailable'

export class CreateClassCustomerDto {
  @IsNotEmpty()
  className: string

  @IsInt()
  numberOfStudents: number

  @IsInt()
  school: number

  @IsArray()
  @Type(() => timeAvailable)
  @ValidateNested({ each: true })
  timesAvailable: timeAvailable[]
}
