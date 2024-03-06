import SchoolType from '../../enums/SchoolType.enum'
import UserFormState from './UserFormState'

interface PrivateCustomerFormState extends UserFormState {
  grade: number | null
  schoolType: SchoolType | null
  feeStandard: number
  feeOnline: number
  notes: string
}

export default PrivateCustomerFormState;