import SchoolState from "../enums/SchoolState.enum"
import UserRole from "../enums/UserRole.enum"
import User from "./User"

interface School extends User {
  role: UserRole.SCHOOL
  schoolName: string
  feeStandard: number
  feeOnline: number
  schoolTypes: string[]
  dateOfStart: string | null
  schoolState: SchoolState
}

export default School;