import LessonState from "../../enums/LessonState.enum"

interface LessonFormState {
  state: LessonState
  notes: string
}

export default LessonFormState;