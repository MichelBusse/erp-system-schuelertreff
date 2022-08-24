import { Dayjs } from 'dayjs'

import { CustomerType } from '../components/ContractDialog'
import { ContractType, DeleteState, SchoolType, TeacherState } from './enums'
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
  deleteState?: DeleteState
}

export interface teacherForm extends userForm {
  subjects: subject[]
  fee: number | null
  degree: string
  teacherSchoolTypes: string[]
  state: TeacherState
  iban: string
  bic: string
  bankAccountOwner: string
  bankInstitution: string
  dateOfBirth: Dayjs | null
  dateOfEmploymentStart: Dayjs | null
}

export interface schoolForm extends Omit<userForm, 'timesAvailable'> {
  schoolName: string
  schoolTypes: string[]
  feeStandard: number
  feeOnline: number
  notes: string
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
  feeStandard: number
  feeOnline: number
  notes: string
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
  contractType: ContractType
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
