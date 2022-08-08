import { IsEnum, IsNumber } from 'class-validator'

import { IsValidDate } from 'src/IsValidDate.decorator'

import { LessonState } from '../lesson.entity'

export class CreateLessonDto {
  @IsValidDate()
  date: string

  @IsEnum(LessonState)
  state: LessonState

  @IsNumber()
  contractId: number

  notes: string
}
