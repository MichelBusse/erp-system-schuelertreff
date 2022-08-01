import {
  Degree,
  LeaveState,
  LeaveType,
  SchoolType,
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
  dateRange: string
  hasAttachment: boolean
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
  schoolTypes: SchoolType[]
}

export interface admin extends user {
  role: 'admin'
}

export interface privateCustomer extends user {
  role: 'privateCustomer'
}

export interface school extends Omit<user, 'lastName' | 'firstName'> {
  role: 'school'
  schoolName: string
}

export interface classCustomer {
  role: 'classCustomer'
  id: number
  className: string
  numberOfStudents: number
  timesAvailableParsed: timesAvailableParsed[]
  timesAvailable: timeAvailable[]
  school: school
}

export type customer = privateCustomer | classCustomer

export default user
