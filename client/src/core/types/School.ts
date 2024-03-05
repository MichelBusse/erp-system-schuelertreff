import SchoolState from "../enums/SchoolState"
import UserRole from "../enums/UserRole"
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