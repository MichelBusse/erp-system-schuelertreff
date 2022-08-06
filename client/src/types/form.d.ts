import { Dayjs } from 'dayjs'

import { CustomerType } from '../components/ContractDialog'
import { TeacherState } from './enums'
import { LessonState } from './lesson'
import subject from './subject'
import timeAvailable from './timeAvailable'
import { classCustomer, customer, privateCustomer, teacher } from './user'

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
  numberOfStudents: number
  timesAvailable: timeAvailable[]
}

export interface privateCustomerForm extends userForm {
  grade: number
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

export type ContractFilterForm = {
  school: {
    id: number
    schoolName: string
  } | null
  classCustomers: classCustomer[]
  privateCustomers: privateCustomer[]
  subject: subject | null
  interval: number
  startDate: Dayjs | null
  endDate: Dayjs | null
  customerType: CustomerType
}

export type ContractCreationForm = {
  startDate: Dayjs | null
  endDate: Dayjs | null
  startTime: Dayjs | null
  endTime: Dayjs | null
  minTime: Dayjs | null
  maxTime: Dayjs | null
  teacher: string
  teacherConfirmation: boolean
  dow: number
  selsuggestion: string
}
