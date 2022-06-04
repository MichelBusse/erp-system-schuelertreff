import { Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'

import { Subject } from 'src/subjects/subject.entity'
import { PrivateCustomer } from 'src/users/entities/privateCustomer.entity'
import { Teacher } from 'src/users/entities/teacher.entity'

import { Weekdays } from '../contract.entity'

export class CreateContractDto {
  //TODO:

  @Type(() => PrivateCustomer)
  @ValidateNested({ each: true })
  customers: PrivateCustomer[]

  teacher: Teacher

  subject: Subject

  weekday: Weekdays

  from: string

  to: string

  startDate: Date

  endDate: Date

  frequency: number
}
