import SchoolType from '../../enums/SchoolType'
import TimeSlot from '../TimeSlot'

interface ClassCustomerFormState {
  id: number
  className: string
  timesAvailable: TimeSlot[]
  schoolType: SchoolType | null
  grade: number | null
}

export default ClassCustomerFormState;