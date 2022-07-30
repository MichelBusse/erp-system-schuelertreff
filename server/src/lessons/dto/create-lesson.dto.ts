import { LessonState } from '../lesson.entity'

export class CreateLessonDto {
  date: string

  state: LessonState

  contractId: number
}
