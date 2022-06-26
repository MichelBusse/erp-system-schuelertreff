import subject from './subject'
import timeAvailable from './timeAvailable'

export interface userForm {
  firstName: string
  lastName: string
  salutation: string
  city: string
  postalCode: string
  street: string
  email: string
  phone: string
  timesAvailable: (timeAvailable & { id: string })[]
}

export interface teacherForm extends userForm {
  subjects: subject[]
  fee: number | null
  degree: string
  schoolTypes: string[]
}

export interface privateCustomerForm extends userForm {
  grade: number | null
}
