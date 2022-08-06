import { Degree, SchoolType, TeacherState } from './enums'
import subject from './subject'
import timeAvailable from './timeAvailable'

export enum Role {
  PRIVATECUSTOMER = 'privateCustomer',
  SCHOOL = 'school',
  TEACHER = 'teacher',
  ADMIN = 'admin',
  CLASSCUSTOMER = 'classCustomer',
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
  fee: number,
  schoolType: SchoolType,
  grade: number
}

export interface school extends Omit<user, 'lastName' | 'firstName'> {
  role: 'school'
  schoolName: string
  fee: number
}

export interface classCustomer {
  role: 'classCustomer'
  id: number
  className: string
  timesAvailableParsed: timesAvailableParsed[]
  timesAvailable: timeAvailable[]
  school: school,
  schoolType: SchoolType,
  grade: number
}

export type customer = privateCustomer | classCustomer

export default user
