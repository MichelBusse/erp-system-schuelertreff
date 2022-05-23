import subject from "./subject"

type teacher = {
  role: string
  id: number
  lastName: string
  firstName: string
  salutation: string
  street: string
  city: string
  postalCode: string
  email: string
  phone: string
  jwtValidAfter: string
  fee: number
  state: string
  subjects: subject[]
}

export default teacher
