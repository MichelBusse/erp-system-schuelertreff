import { GridLocaleText } from '@mui/x-data-grid'
import { OptionsObject as SnackbarOptions } from 'notistack'

import { TeacherState } from './types/enums'
import { privateCustomerForm, teacherForm } from './types/form'

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

export const defaultSchoolFormData = {
  schoolName: '',
  city: '',
  postalCode: '',
  street: '',
  email: '',
  phone: '',
  schoolTypes: [],
  fee: 0
}

export const defaultClassCustomerFormData = {
  id: -1,
  className: '',
  numberOfStudents: 0,
  grade: 0,
  timesAvailable: [],
  schoolTypes: [],
}
