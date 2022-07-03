import { Degree } from './enums'
import subject from './subject'
import timeAvailable from './timeAvailable'

interface user {
  role: 'admin' | 'teacher' | 'privateCustomer' | 'schoolCustomer' | 'classCustomer'
  id: number
  lastName: string
  firstName: string
  salutation: string
  street: string
  city: string
  postalCode: string
  email: string
  phone: string
  timesAvailableParsed: timesAvailableParsed[]
  timesAvailable: timeAvailable[]
}

export type timesAvailableParsed = {
  start: string
  end: string
  dow: number
}

export interface teacher extends user {
  role: 'teacher'
  fee: number
  state: string
  degree: Degree
  subjects: subject[]
}

export interface admin extends user {
  role: 'admin'
}

export interface privateCustomer extends user {
  role: 'privateCustomer'
}

export interface schoolCustomer
  extends Omit<user, 'lastName' | 'firstName'> {
  role: 'schoolCustomer'
  schoolName: string
}

export interface classCustomer
  extends Omit<user, 'lastName' | 'firstName' | 'salutation' | 'street' | 'city' | 'postalCode' | 'email' | 'phone'> {
  role: 'classCustomer'
  className: string
  numberOfStudents: number
}

export type customer = privateCustomer | classCustomer

export default user
