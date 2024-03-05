import UserFormErrorTexts from './UserFormErrorTexts'

interface SchoolFormErrorTexts extends UserFormErrorTexts {
  schoolName: string
  schoolTypes: string
  feeStandard: string
  feeOnline: string
  notes: string
  dateOfStart: string
  valid: boolean
}

export default SchoolFormErrorTexts;
