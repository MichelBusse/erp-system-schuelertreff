import { Dayjs } from 'dayjs'
import { contract } from './contract'
import { LessonState } from './lesson'
import subject from './subject'
import timeAvailable from './timeAvailable'
import { customer, teacher } from './user'

export interface userForm {
  firstName: string
  lastName: string
  salutation: string
  city: string
  postalCode: string
  street: string
  email: string
  phone: string
  timesAvailable: (timeAvailable & { id: string })[]
}

export interface teacherForm extends userForm {
  subjects: subject[]
  fee: number | null
  degree: string
  schoolTypes: string[]
}

export interface privateCustomerForm extends userForm {
  grade: number | null
}

export interface lessonForm {
  state: LessonState,
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
