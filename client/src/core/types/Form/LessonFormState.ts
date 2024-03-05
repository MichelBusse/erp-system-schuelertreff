import LessonState from "../../enums/LessonState"

interface LessonFormState {
  state: LessonState
  notes: string
}

export default LessonFormState;