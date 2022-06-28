import { GridLocaleText } from '@mui/x-data-grid'

import subject from './types/subject'

export const dataGridLocaleText: Partial<GridLocaleText> = {
  filterPanelColumns: 'Spalte',
  filterPanelOperators: 'Operator',
  filterPanelInputLabel: 'Wert',
  filterOperatorContains: 'enthält',
  filterPanelInputPlaceholder: 'Eingabe',
}

export const defaultTeacherFormData = {
  firstName: '',
  lastName: '',
  salutation: '',
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

export const defaultPrivateCustomerFormData = {
  firstName: '',
  lastName: '',
  salutation: '',
  city: '',
  postalCode: '',
  street: '',
  email: '',
  phone: '',
  grade: null,
  timesAvailable: [],
}

export const defaultSchoolCustomerFormData = {
  schoolName: '',
  city: '',
  postalCode: '',
  street: '',
  email: '',
  phone: '',
  schoolTypes: [''],
}

export const defaultClassCustomerFormData = {
  className: '',
  numberOfStudents: 0,
  grade: 0,
  timesAvailable: [],
}
