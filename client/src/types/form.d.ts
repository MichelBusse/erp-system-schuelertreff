import { Dayjs } from 'dayjs'

import { TeacherState } from './enums'
import { LessonState } from './lesson'
import subject from './subject'
import timeAvailable from './timeAvailable'
import { customer, teacher } from './user'

export interface userForm {
  firstName: string
  lastName: string
  city: string
  postalCode: string
  street: string
  email: string
  phone: string
  timesAvailable: timeAvailable[]
}

export interface teacherForm extends userForm {
  subjects: subject[]
  fee: number | null
  degree: string
  schoolTypes: string[]
  state: TeacherState
}

export interface schoolCustomerForm
  extends Omit<userForm, 'lastName' | 'firstName' | 'timesAvailable'> {
  schoolName: string
  schoolTypes: string[]
}

export interface classCustomerForm {
  className: string
  numberOfStudents: number
  grade: number
  schoolTypes: string[]
  timesAvailable: timeAvailable[]
}

export interface privateCustomerForm extends userForm {
  grade: number | null
}

export interface lessonForm {
  state: LessonState
}

export type contractForm = {
  startDate: Dayjs | null
  endDate: Dayjs | null
  startTime: Dayjs | null
  endTime: Dayjs | null
  teacher: teacher | null
  dow: number | null
  interval: number
  customers: customer[]
  subject: subject | null
}
