import SchoolType from "../enums/SchoolType"
import UserRole from "../enums/UserRole"
import User from "./User"

interface PrivateCustomer extends User {
  role: UserRole.PRIVATECUSTOMER
  feeStandard: number
  feeOnline: number
  schoolType: SchoolType
  grade: number
}

export default PrivateCustomer;