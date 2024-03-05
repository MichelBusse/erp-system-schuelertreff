import { GridLocaleText } from '@mui/x-data-grid'
import { OptionsObject as SnackbarOptions } from 'notistack'

import TeacherState from '../enums/TeacherState'
import SchoolType from '../enums/SchoolType'
import SchoolState from '../enums/SchoolState'
import LeaveType from '../enums/LeaveType'
import LeaveState from '../enums/LeaveState'
import ContractState from '../enums/ContractState'
import ContractType from '../enums/ContractType'
import TeacherSchoolType from '../enums/TeacherSchoolType'
import TeacherDegree from '../enums/TeacherDegree'
import TeacherFormState from '../types/Form/TeacherFormState'
import PrivateCustomerFormState from '../types/Form/PrivateCustomerFormState'
import SchoolFormState from '../types/Form/SchoolFormState'
import ClassCustomerFormState from '../types/Form/ClassCustomerFormState'

export const dataGridLocaleText: Partial<GridLocaleText> = {
  filterPanelColumns: 'Spalte',
  filterPanelOperators: 'Operator',
  filterPanelInputLabel: 'Wert',
  filterOperatorContains: 'enthält',
  filterPanelInputPlaceholder: 'Eingabe',
  noRowsLabel: 'Keine Einträge',
  MuiTablePagination: { labelRowsPerPage: 'Einträge pro Seite:' },
}

export const defaultTeacherFormData: TeacherFormState = {
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

export const defaultPrivateCustomerFormData: PrivateCustomerFormState = {
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

export const degreeToString: { [key in TeacherDegree]: string } = {
  noinfo: 'Keine Angabe',
  highschool: 'Abitur',
  bachelor: 'Bachelor',
  master: 'Master',
}

export const defaultSchoolFormData: SchoolFormState = {
  timesAvailable: [],
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

export const defaultClassCustomerFormData: ClassCustomerFormState = {
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
