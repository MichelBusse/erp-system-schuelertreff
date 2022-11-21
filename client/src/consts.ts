import { GridLocaleText } from '@mui/x-data-grid'
import { OptionsObject as SnackbarOptions } from 'notistack'

import { ContractState } from './types/contract'
import {
  ContractType,
  Degree,
  LeaveState,
  LeaveType,
  SchoolState,
  SchoolType,
  TeacherSchoolType,
  TeacherState,
} from './types/enums'
import {
  classCustomerForm,
  privateCustomerForm,
  schoolForm,
  teacherForm,
} from './types/form'

export const dataGridLocaleText: Partial<GridLocaleText> = {
  filterPanelColumns: 'Spalte',
  filterPanelOperators: 'Operator',
  filterPanelInputLabel: 'Wert',
  filterOperatorContains: 'enthält',
  filterPanelInputPlaceholder: 'Eingabe',
  noRowsLabel: 'Keine Einträge',
  MuiTablePagination: { labelRowsPerPage: 'Einträge pro Seite:' },
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
  teacherSchoolTypes: [],
  timesAvailable: [],
  state: TeacherState.CREATED,
  iban: '',
  bic: '',
  bankAccountOwner: '',
  bankInstitution: '',
  dateOfBirth: null,
  dateOfApplication: null,
  dateOfApplicationMeeting: null,
  dateOfEmploymentStart: null,
  applicationLocation: '',
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
  schoolType: SchoolType.ANDERE,
  timesAvailable: [],
  feeStandard: 30,
  feeOnline: 20,
  notes: '',
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
  interview: 'Beworben',
  applied: 'BG gehalten',
  contract: 'Angenommen',
  employed: 'Eingestellt',
}

export const schoolStateToString: { [key in SchoolState]: string } = {
  created: 'Registriert',
  confirmed: 'Bestätigt',
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

export const contractTypeToString: { [key in ContractType]: string } = {
  online: 'Online',
  standard: 'Präsenz',
}

export const teacherSchoolTypeToString: { [key in TeacherSchoolType]: string } =
  {
    grundschule: 'Grundschule',
    oberschule: 'Oberschule',
    sek1: 'Gymnasium Sek. 1',
    sek2: 'Gymnasium Sek. 2',
  }

export const degreeToString: { [key in Degree]: string } = {
  noinfo: 'Keine Angabe',
  highschool: 'Abitur',
  bachelor: 'Bachelor',
  master: 'Master',
}

export const defaultSchoolFormData: schoolForm = {
  firstName: '',
  lastName: '',
  schoolName: '',
  city: '',
  postalCode: '',
  street: '',
  email: '',
  phone: '',
  schoolTypes: [],
  feeStandard: 30,
  feeOnline: 20,
  notes: '',
  dateOfStart: null,
  schoolState: SchoolState.CREATED,
}

export const defaultClassCustomerFormData: classCustomerForm = {
  id: -1,
  className: '',
  timesAvailable: [],
  schoolType: null,
  grade: null,
}

export const defaultSubjectFormData = {
  color: '#FF0000',
  name: '',
  shortForm: '',
}
