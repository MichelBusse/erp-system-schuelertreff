type privateCustomer = {
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
  state: string
  subjects: subject[]
}

export default privateCustomer
