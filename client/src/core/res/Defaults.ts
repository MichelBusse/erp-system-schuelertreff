import LeaveState from '../enums/LeaveState.enum'
import LeaveType from '../enums/LeaveType.enum'
import SchoolState from '../enums/SchoolState.enum'
import SchoolType from '../enums/SchoolType.enum'
import TeacherState from '../enums/TeacherState.enum'
import ConfirmationDialogData from '../types/ConfirmationDialogData'
import ClassCustomerFormState from '../types/Form/ClassCustomerFormState'
import LeaveFormState from '../types/Form/LeaveFormState'
import PrivateCustomerFormErrorTexts from '../types/Form/PrivateCustomerFormErrorTexts'
import PrivateCustomerFormState from '../types/Form/PrivateCustomerFormState'
import SchoolFormErrorTexts from '../types/Form/SchoolFormErrorTexts'
import SchoolFormState from '../types/Form/SchoolFormState'
import SubjectFormErrorTexts from '../types/Form/SubjectFormErrorTexts'
import SubjectFormState from '../types/Form/SubjectFormState'
import TeacherFormErrorTexts from '../types/Form/TeacherFormErrorTexts'
import TeacherFormState from '../types/Form/TeacherFormState'

export const DEFAULT_TEACHER_FORM_STATE: TeacherFormState = {
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

export const DEFAULT_TEACHER_FORM_ERROR_TEXTS: TeacherFormErrorTexts = {
  firstName: '',
  lastName: '',
  city: '',
  postalCode: '',
  street: '',
  email: '',
  phone: '',
  timesAvailable: '',
  subjects: '',
  fee: '',
  degree: '',
  teacherSchoolTypes: '',
  state: '',
  iban: '',
  bic: '',
  bankAccountOwner: '',
  bankInstitution: '',
  dateOfBirth: '',
  dateOfEmploymentStart: '',
  valid: true,
  dateOfApplication: '',
  dateOfApplicationMeeting: '',
  applicationLocation: '',
}

export const DEFAULT_PRIVATE_CUSTOMER_FORM_STATE: PrivateCustomerFormState = {
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

export const DEFAULT_PRIVATE_CUSTOMER_FORM_ERROR_TEXTS: PrivateCustomerFormErrorTexts =
  {
    firstName: '',
    lastName: '',
    city: '',
    postalCode: '',
    street: '',
    email: '',
    phone: '',
    timesAvailable: '',
    grade: '',
    schoolType: '',
    feeStandard: '',
    feeOnline: '',
    notes: '',
    valid: true,
  }

export const DEFAULT_SCHOOL_FORM_STATE: SchoolFormState = {
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

export const DEFAULT_SCHOOL_FORM_ERROR_TEXTS: SchoolFormErrorTexts = {
  firstName: '',
  lastName: '',
  city: '',
  postalCode: '',
  street: '',
  email: '',
  phone: '',
  timesAvailable: '',
  schoolName: '',
  schoolTypes: '',
  feeStandard: '',
  feeOnline: '',
  notes: '',
  dateOfStart: '',
  valid: true,
}

export const DEFAULT_CLASS_CUSTOMER_FORM_STATE: ClassCustomerFormState = {
  id: -1,
  className: '',
  timesAvailable: [],
  schoolType: null,
  grade: null,
}

export const DEFAULT_SUBJECT_FORM_STATE: SubjectFormState = {
  color: '#FF0000',
  name: '',
  shortForm: '',
}

export const DEFAULT_SUBJECT_FORM_ERROR_TEXTS : SubjectFormErrorTexts = {
  color: '',
  name: '',
  shortForm: '',
  valid: true,
}

export const DEFAULT_CONFIRMATION_DIALOG_DATA: ConfirmationDialogData = {
  open: false,
  setProps: () => {},
  title: '',
  text: '',
  action: () => {},
}

export const DEFAULT_LEAVE_FORM_STATE: LeaveFormState = {
  type: LeaveType.REGULAR,
  state: LeaveState.PENDING,
  startDate: null,
  endDate: null,
  hasAttachment: false,
}