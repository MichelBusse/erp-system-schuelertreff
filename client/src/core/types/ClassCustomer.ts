import SchoolType from "../enums/SchoolType.enum"
import UserRole from "../enums/UserRole.enum"
import School from "./School"
import TimeSlot from "./TimeSlot"
import TimeSlotParsed from "./TimeSlotParsed"

interface ClassCustomer {
  role: UserRole.CLASSCUSTOMER
  id: number
  className: string
  timesAvailableParsed: TimeSlotParsed[]
  timesAvailable: TimeSlot[]
  school: School
  schoolType: SchoolType
  grade: number
  defaultClassCustomer?: boolean
}

export default ClassCustomer;