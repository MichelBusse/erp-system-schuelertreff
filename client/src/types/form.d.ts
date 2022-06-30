import subject from './subject'
import timeAvailable from './timeAvailable'

interface userForm {
  firstName: string
  lastName: string
  salutation: string
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
}

export interface schoolCustomerForm
  extends Omit<userForm, 'lastName' | 'firstName' | 'salutation' | 'timesAvailable'> {
  schoolName: string
  schoolTypes: string[]
}

export interface classCustomerForm
  extends Omit<userForm, 'lastName' | 'firstName' | 'salutation' | 'street' | 'city' | 'postalCode' | 'email' | 'phone'> {
  className: string
  numberOfStudents: number
  grade: number
  schoolTypes: string[]
}

export interface privateCustomerForm extends userForm {
  grade: number | null
}
