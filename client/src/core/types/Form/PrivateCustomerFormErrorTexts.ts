import UserFormErrorTexts from "./UserFormErrorTexts"

interface PrivateCustomerFormErrorTexts extends UserFormErrorTexts {
  grade: string
  schoolType: string
  feeStandard: string
  feeOnline: string
  notes: string
  valid: boolean
}

export default PrivateCustomerFormErrorTexts;