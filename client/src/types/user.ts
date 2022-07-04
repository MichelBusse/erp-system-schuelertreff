import { Degree, SchoolType, TeacherState } from './enums'
import subject from './subject'
import timeAvailable from './timeAvailable'

export enum Role {
  PRIVATECUSTOMER = 'privateCustomer',
  SCHOOLCUSTOMER = 'schoolCustomer',
  TEACHER = 'teacher',
  ADMIN = 'admin',
}

interface user {
  role:
    | 'admin'
    | 'teacher'
    | 'privateCustomer'
    | 'schoolCustomer'
    | 'classCustomer'
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
}

export interface schoolCustomer extends Omit<user, 'lastName' | 'firstName'> {
  role: 'schoolCustomer'
  schoolName: string
}

export interface classCustomer {
  role: 'classCustomer'
  id: number
  className: string
  numberOfStudents: number
  timesAvailableParsed: timesAvailableParsed[]
  timesAvailable: timeAvailable[]
}

export type customer = privateCustomer | classCustomer

export default user
