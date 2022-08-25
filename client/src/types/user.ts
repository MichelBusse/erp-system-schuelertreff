import { Dayjs } from 'dayjs'
import {
  Degree,
  DeleteState,
  LeaveState,
  LeaveType,
  SchoolType,
  TeacherSchoolType,
  TeacherState,
} from './enums'
import subject from './subject'
import timeAvailable from './timeAvailable'

export enum Role {
  PRIVATECUSTOMER = 'privateCustomer',
  SCHOOL = 'school',
  TEACHER = 'teacher',
  ADMIN = 'admin',
  CLASSCUSTOMER = 'classCustomer',
}

export type leave = {
  id: number
  type: LeaveType
  state: LeaveState
  startDate: string
  endDate: string
  hasAttachment: boolean
  user: {
    id: number
    firstName: string
    lastName: string
  }
}

interface user {
  role: 'admin' | 'teacher' | 'privateCustomer' | 'classCustomer' | 'school'
  id: number
  lastName: string
  firstName: string
  street: string
  city: string
  postalCode: string
  email: string
  phone: string
  timesAvailableParsed: timesAvailableParsed[]
  timesAvailable: (timeAvailable & { id: string })[]
  leave: leave[]
  deleteState?: DeleteState
}

export type timesAvailableParsed = {
  start: string
  end: string
  dow: number
}

export interface teacher extends user {
  role: 'teacher'
  fee: number
  state: TeacherState
  degree: Degree
  subjects: subject[]
  teacherSchoolTypes: TeacherSchoolType[]
  iban: string
  bic: string
  bankAccountOwner: string
  bankInstitution: string
  dateOfBirth: string | null
  dateOfEmploymentStart: string | null
}

export interface admin extends user {
  role: 'admin'
}

export interface privateCustomer extends user {
  role: 'privateCustomer'
  feeStandard: number
  feeOnline: number
  schoolType: SchoolType
  grade: number
}

export interface school extends Omit<user, 'lastName' | 'firstName'> {
  role: 'school'
  schoolName: string
  feeStandard: number
  feeOnline: number
  schoolTypes: string[]
  dateOfStart: string | null
}

export interface classCustomer {
  role: 'classCustomer'
  id: number
  className: string
  timesAvailableParsed: timesAvailableParsed[]
  timesAvailable: timeAvailable[]
  school: school
  schoolType: SchoolType
  grade: number
}

export type customer = privateCustomer | classCustomer

export default user
