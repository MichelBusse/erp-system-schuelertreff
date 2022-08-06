import { Dayjs } from 'dayjs'

import { SchoolType, TeacherState } from './enums'
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

export interface schoolForm
  extends Omit<userForm, 'timesAvailable'> {
  schoolName: string
  schoolTypes: string[]
  fee: number
}

export interface classCustomerForm {
  id: number
  className: string
  timesAvailable: timeAvailable[]
  schoolType: SchoolType | null
  grade: number | null
}

export interface privateCustomerForm extends userForm {
  grade: number | null
  schoolType: SchoolType | null
  fee: number
}

export interface lessonForm {
  state: LessonState
  notes: string
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
