import subject from './subject'

interface user {
  role: 'admin' | 'teacher' | 'customer'
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

export interface teacher extends user {
  role: 'teacher'
  fee: number
  state: string
  subjects: subject[]
}

export interface customer extends user {
  role: 'customer'
}

export interface admin extends user {
  role: 'admin'
}

export default user
