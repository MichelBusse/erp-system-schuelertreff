import UserDeleteState from "../enums/UserDeleteState"
import UserRole from "../enums/UserRole"
import Leave from "./Leave"
import TimeSlot from "./TimeSlot"
import TimeSlotParsed from "./TimeSlotParsed"

interface User {
  role: UserRole
  id: number
  lastName: string
  firstName: string
  street: string
  city: string
  postalCode: string
  email: string
  phone: string
  timesAvailableParsed: TimeSlotParsed[]
  timesAvailable: (TimeSlot & { id: string })[]
  leave: Leave[]
  deleteState?: UserDeleteState
}

export default User;