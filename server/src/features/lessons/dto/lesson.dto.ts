import { IsEnum, IsNumber } from 'class-validator'

import { IsValidDate } from 'src/core/decorators/IsValidDate.decorator'
import LessonState from 'src/core/enums/LessonState.enum'

/**
 * Schema for creating or updating a lesson
 */ 
export class LessonDto {
  @IsValidDate()
  date: string

  @IsEnum(LessonState)
  state: LessonState

  @IsNumber()
  contractId: number

  notes: string
}
