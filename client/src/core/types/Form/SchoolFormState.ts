import { Dayjs } from 'dayjs'
import SchoolState from '../../enums/SchoolState'
import UserFormState from './UserFormState'

interface SchoolFormState extends UserFormState {
  schoolName: string
  schoolTypes: string[]
  feeStandard: number
  feeOnline: number
  notes: string
  dateOfStart: Dayjs | null
  schoolState: SchoolState
}

export default SchoolFormState
