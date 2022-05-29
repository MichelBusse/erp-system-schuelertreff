import { Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'

import { Subject } from 'src/subjects/subject.entity'
import { Customer } from 'src/users/entities/customer.entity'
import { Teacher } from 'src/users/entities/teacher.entity'

import { Weekdays } from '../contract.entity'

export class CreateContractDto {
  //TODO:

  @Type(() => Customer)
  @ValidateNested({ each: true })
  customers: Customer[]

  teacher: Teacher

  subject: Subject

  weekday: Weekdays

  from: string

  to: string

  startDate: Date

  endDate: Date

  interval: number
}
