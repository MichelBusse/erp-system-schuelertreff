import { GridLocaleText } from '@mui/x-data-grid'
import { OptionsObject as SnackbarOptions } from 'notistack'

import { privateCustomerForm, teacherForm } from './types/form'
import subject from './types/subject'

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
  subjects: [] as subject[],
  fee: null,
  degree: '',
  schoolTypes: [],
  timesAvailable: [],
}

export const defaultPrivateCustomerFormData: privateCustomerForm = {
  firstName: '',
  lastName: '',
  city: '',
  postalCode: '',
  street: '',
  email: '',
  phone: '',
  grade: null,
  timesAvailable: [],
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
