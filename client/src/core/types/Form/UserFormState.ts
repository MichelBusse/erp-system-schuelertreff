import UserDeleteState from "../../enums/UserDeleteState"
import TimeSlot from "../TimeSlot"

interface UserFormState {
  firstName: string
  lastName: string
  city: string
  postalCode: string
  street: string
  email: string
  phone: string
  timesAvailable: TimeSlot[]
  deleteState?: UserDeleteState
}

export default UserFormState;