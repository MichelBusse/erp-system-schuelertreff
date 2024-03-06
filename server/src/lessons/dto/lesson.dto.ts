import { IsEnum, IsNumber } from 'class-validator'

import { IsValidDate } from 'src/IsValidDate.decorator'

import { LessonState } from '../lesson.entity'

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
