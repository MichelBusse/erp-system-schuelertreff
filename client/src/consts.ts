import { GridLocaleText } from '@mui/x-data-grid'
import { OptionsObject as SnackbarOptions } from 'notistack'

import { ContractState } from './types/contract'
import { LeaveState, LeaveType, TeacherState } from './types/enums'
import { classCustomerForm, privateCustomerForm, schoolForm, teacherForm } from './types/form'

export const dataGridLocaleText: Partial<GridLocaleText> = {
  filterPanelColumns: 'Spalte',
  filterPanelOperators: 'Operator',
  filterPanelInputLabel: 'Wert',
  filterOperatorContains: 'enthält',
  filterPanelInputPlaceholder: 'Eingabe',
}

export const defaultTeacherFormData: teacherForm = {
  firstName: '',
  lastName: '',
  city: '',
  postalCode: '',
  street: '',
  email: '',
  phone: '',
  subjects: [],
  fee: null,
  degree: '',
  schoolTypes: [],
  timesAvailable: [],
  state: TeacherState.CREATED,
}

export const defaultPrivateCustomerFormData: privateCustomerForm = {
  firstName: '',
  lastName: '',
  city: '',
  postalCode: '',
  street: '',
  email: '',
  phone: '',
  grade: 0,
  timesAvailable: [],
  fee: 0
}

export const snackbarOptions: SnackbarOptions = {
  anchorOrigin: {
    vertical: 'bottom',
    horizontal: 'left',
  },
}

export const snackbarOptionsError: SnackbarOptions = {
  ...snackbarOptions,
  variant: 'error',
}

export const teacherStateToString: { [key in TeacherState]: string } = {
  created: 'Registriert',
  applied: 'Beworben',
  employed: 'Angestellt',
  suspended: 'Suspendiert',
  deleted: 'Gelöscht',
}

export const leaveTypeToString: { [key in LeaveType]: string } = {
  regular: 'Urlaub',
  sick: 'Krankmeldung',
}

export const leaveStateToString: { [key in LeaveState]: string } = {
  pending: 'ausstehend',
  accepted: 'bestätigt',
  declined: 'abgelehnt',
}

export const contractStateToString: { [key in ContractState]: string } = {
  pending: 'ausstehend',
  accepted: 'bestätigt',
  declined: 'abgelehnt',
}

export const defaultSchoolFormData = {
  firstName: '',
  lastName: '',
  schoolName: '',
  city: '',
  postalCode: '',
  street: '',
  email: '',
  phone: '',
  schoolTypes: [],
  fee: 0
}

export const defaultClassCustomerFormData : classCustomerForm = {
  id: -1,
  className: '',
  numberOfStudents: 0,
  timesAvailable: [],
}
