import SchoolType from "../enums/SchoolType.enum"
import UserRole from "../enums/UserRole.enum"
import User from "./User"

interface PrivateCustomer extends User {
  role: UserRole.PRIVATECUSTOMER
  feeStandard: number
  feeOnline: number
  schoolType: SchoolType
  grade: number
}

export default PrivateCustomer;