import LessonState from "../enums/LessonState.enum"
import { Contract } from "./Contract"

type Lesson = {
  id: number
  date: string
  state: LessonState
  contract: Contract
}

export default Lesson;