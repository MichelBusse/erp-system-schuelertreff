import subject from "./subject"
import timeAvailable from "./timeAvailable"

export type form = {
  firstName: string
  lastName: string
  salutation: string
  city: string
  postalCode: string
  street: string
  email: string
  phone: string
  subjects: subject[]
  fee: number
  timesAvailable: (timeAvailable & { id: string })[]
}