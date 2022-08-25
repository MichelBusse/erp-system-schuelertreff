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
export interface userFormErrorTexts {
  firstName: string
  lastName: string
  city: string
  postalCode: string
  street: string
  email: string
  phone: string
  timesAvailable: string
  valid: boolean
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
export interface teacherFormErrorTexts extends userFormErrorTexts {
  subjects: string
  fee: string
  degree: string
  teacherSchoolTypes: string
  state: string
  iban: string
  bic: string
  bankAccountOwner: string
  bankInstitution: string
  dateOfBirth: string
  dateOfEmploymentStart: string
}

export interface schoolForm extends Omit<userForm, 'timesAvailable'> {
  schoolName: string
  schoolTypes: string[]
  feeStandard: number
  feeOnline: number
  notes: string
  dateOfStart: Dayjs | null
}
export interface schoolFormErrorTexts extends userFormErrorTexts {
  schoolName: string
  schoolTypes: string
  feeStandard: string
  feeOnline: string
  notes: string
  dateOfStart: string
  valid: boolean
}

export interface classCustomerForm {
  id: number
  className: string
  timesAvailable: timeAvailable[]
  schoolType: SchoolType | null
  grade: number | null
}
export interface classCustomerFormErrorTexts {
  schoolName: string
  schoolTypes: string
  feeStandard: string
  feeOnline: string
  notes: string
}

export interface privateCustomerForm extends userForm {
  grade: number | null
  schoolType: SchoolType | null
  feeStandard: number
  feeOnline: number
  notes: string
}
export interface privateCustomerFormErrorTexts extends userFormErrorTexts {
  grade: string
  schoolType: string
  feeStandard: string
  feeOnline: string
  notes: string
  valid: boolean
}

export interface lessonForm {
  state: LessonState
  notes: string
}
export interface lessonFormErrorTexts {
  state: string
  notes: string
  valid: boolean
}

export interface subjectForm {
  color: string
  name: string
  shortForm: string
}

export interface subjectFormErrorTexts {
  color: string
  name: string
  shortForm: string
  valid: boolean
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
export type contractFormErrorTexts = {
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  teacher: string
  dow: string
  interval: string
  customers: string
  subject: string
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
export type ContractFilterFormErrorTexts = {
  school: string
  classCustomers: string
  privateCustomers: string
  subject: string
  interval: string
  startDate: string
  endDate: string
  customerType: string
  contractType: string
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
export type ContractCreationFormErrorTexts = {
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  minTime: string
  maxTime: string
  teacher: string
  teacherConfirmation: string
  dow: string
  selsuggestion: string
}
