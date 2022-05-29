import { Type } from 'class-transformer'
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  Max,
  Min,
  ValidateNested,
} from 'class-validator'

import { Subject } from 'src/subjects/subject.entity'
import { Customer } from 'src/users/entities/customer.entity'
import { Teacher } from 'src/users/entities/teacher.entity'

export class CreateContractDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => Customer)
  customers: Customer[]

  @Type(() => Teacher)
  teacher: Teacher

  @Type(() => Subject)
  subject: Subject

  startTime: string

  endTime: string

  startDate: Date

  endDate: Date

  @Min(1)
  @Max(4)
  @IsInt()
  interval: number
}
