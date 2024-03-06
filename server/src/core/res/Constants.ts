import TeacherState from '../enums/TeacherState.enum'

// the week of 2001-01-01 is used as dummy, DOW and time is important here
export const MAX_TIME_RANGE = '[2001-01-01 00:00, 2001-01-08 00:00)'

export const ALLOWED_TEACHER_STATE_TRANSITIONS: Record<
  TeacherState,
  TeacherState[]
> = {
  created: [TeacherState.CREATED, TeacherState.INTERVIEW],
  interview: [TeacherState.INTERVIEW, TeacherState.APPLIED],
  applied: [TeacherState.APPLIED, TeacherState.CONTRACT],
  contract: [TeacherState.CONTRACT, TeacherState.EMPLOYED],
  employed: [TeacherState.EMPLOYED],
}
