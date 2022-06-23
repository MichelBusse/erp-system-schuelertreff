import subject from './subject'

interface user {
  role: 'admin' | 'teacher' | 'privateCustomer' | 'schoolCustomer'
  id: number
  lastName: string
  firstName: string
  salutation: string
  street: string
  city: string
  postalCode: string
  email: string
  phone: string
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
  subjects: subject[]
  timesAvailableParsed: timesAvailableParsed[]
}

export interface admin extends user {
  role: 'admin'
}

export interface privateCustomer extends user {
  role: 'privateCustomer'
}

export interface schoolCustomer
  extends Omit<user, 'lastName' | 'firstName' | 'salutation'> {
  role: 'schoolCustomer'
  schoolName: string
}

export type customer = privateCustomer | schoolCustomer

export default user
