import dayjs from 'dayjs'
import TeacherFormState from '../types/Form/TeacherFormState'
import PrivateCustomerFormState from '../types/Form/PrivateCustomerFormState'
import SchoolFormState from '../types/Form/SchoolFormState'
import SubjectFormState from '../types/Form/SubjectFormState'
import {
  DEFAULT_TEACHER_FORM_ERROR_TEXTS,
  DEFAULT_PRIVATE_CUSTOMER_FORM_ERROR_TEXTS,
  DEFAULT_SCHOOL_FORM_ERROR_TEXTS,
  DEFAULT_SUBJECT_FORM_ERROR_TEXTS,
} from '../res/Defaults'

export const testEmail = (email: string) => /.+@.+\.[A-Za-z]+$/.test(email)

export function teacherFormValidation(form: TeacherFormState, admin?: boolean) {
  let errorTexts = { ...DEFAULT_TEACHER_FORM_ERROR_TEXTS }

  if (form.firstName.trim() === '') {
    errorTexts.firstName = 'Fehlt'
    errorTexts.valid = false
  }

  if (form.lastName.trim() === '') {
    errorTexts.lastName = 'Fehlt'
    errorTexts.valid = false
  }

  if (form.postalCode !== '' && !form.postalCode.match(/\d{5}/)) {
    errorTexts.postalCode = 'PLZ muss aus 5 Ziffern bestehen'
    errorTexts.valid = false
  }

  if (!form.email.match(/\S+@\S+\.\S+/)) {
    errorTexts.email = 'Keine korrekte E-Mail'
    errorTexts.valid = false
  }

  if (form.phone !== '' && form.phone.length < 9) {
    errorTexts.phone = 'Tel. muss mind. 9 Ziffern besitzen'
    errorTexts.valid = false
  }

  if (form.iban !== '' && form.iban.length !== 22) {
    errorTexts.iban = 'IBAN muss 22 Zeichen besitzen'
    errorTexts.valid = false
  }

  if (form.dateOfBirth !== null && !dayjs(form.dateOfBirth).isValid()) {
    errorTexts.dateOfBirth = 'Kein korrektes Datum'
    errorTexts.valid = false
  }

  if (
    form.dateOfApplication !== null &&
    !dayjs(form.dateOfApplication).isValid()
  ) {
    errorTexts.dateOfApplication = 'Kein korrektes Datum'
    errorTexts.valid = false
  }

  if (
    form.dateOfApplicationMeeting !== null &&
    !dayjs(form.dateOfApplicationMeeting).isValid()
  ) {
    errorTexts.dateOfApplicationMeeting = 'Kein korrektes Datum'
    errorTexts.valid = false
  }

  if (
    form.dateOfEmploymentStart !== null &&
    !dayjs(form.dateOfEmploymentStart).isValid()
  ) {
    errorTexts.dateOfEmploymentStart = 'Kein korrektes Datum'
    errorTexts.valid = false
  }

  if (!admin) {
    const workContractErrorTexts = workContractFormValidation(form, false)
    errorTexts = { ...errorTexts, ...workContractErrorTexts }
  }

  return errorTexts
}

export function workContractFormValidation(
  form: TeacherFormState,
  admin = true,
) {
  const errorTexts = { ...DEFAULT_TEACHER_FORM_ERROR_TEXTS }

  if (form.firstName.trim() === '') {
    errorTexts.firstName = 'Fehlt'
    errorTexts.valid = false
  }

  if (form.lastName.trim() === '') {
    errorTexts.lastName = 'Fehlt'
    errorTexts.valid = false
  }

  if (form.dateOfBirth === null || !dayjs(form.dateOfBirth).isValid()) {
    errorTexts.dateOfBirth = 'Kein korrektes Datum'
    errorTexts.valid = false
  }

  if (
    admin &&
    (form.dateOfEmploymentStart === null ||
      !dayjs(form.dateOfEmploymentStart).isValid())
  ) {
    errorTexts.dateOfEmploymentStart = 'Kein korrektes Datum'
    errorTexts.valid = false
  }

  if (!form.postalCode.match(/\d{5}/)) {
    errorTexts.postalCode = 'PLZ muss aus 5 Ziffern bestehen'
    errorTexts.valid = false
  }

  if (form.city.trim() === '') {
    errorTexts.city = 'Fehlt'
    errorTexts.valid = false
  }

  if (form.street.trim() === '') {
    errorTexts.street = 'Fehlt'
    errorTexts.valid = false
  }

  if (!form.email.match(/\S+@\S+\.\S+/)) {
    errorTexts.email = 'Keine korrekte E-Mail'
    errorTexts.valid = false
  }

  if (form.phone.length < 9) {
    errorTexts.phone = 'Tel. muss mind. 9 Ziffern besitzen'
    errorTexts.valid = false
  }

  if (admin && (form.fee === null || form.fee <= 0)) {
    errorTexts.fee = 'Muss größer 0 sein'
    errorTexts.valid = false
  }

  if (form.iban.length !== 22) {
    errorTexts.iban = 'IBAN muss 22 Zeichen besitzen'
    errorTexts.valid = false
  }

  if (form.bic.trim() === '') {
    errorTexts.bic = 'Fehlt'
    errorTexts.valid = false
  }

  if (form.bankAccountOwner.trim() === '') {
    errorTexts.bankAccountOwner = 'Fehlt'
    errorTexts.valid = false
  }

  if (form.bankInstitution.trim() === '') {
    errorTexts.bankInstitution = 'Fehlt'
    errorTexts.valid = false
  }

  return errorTexts
}

export function efzFormValidation(form: TeacherFormState) {
  const errorTexts = { ...DEFAULT_TEACHER_FORM_ERROR_TEXTS }

  if (form.firstName.trim() === '') {
    errorTexts.firstName = 'Fehlt'
    errorTexts.valid = false
  }

  if (form.lastName.trim() === '') {
    errorTexts.lastName = 'Fehlt'
    errorTexts.valid = false
  }

  if (form.dateOfBirth === null || !dayjs(form.dateOfBirth).isValid()) {
    errorTexts.dateOfBirth = 'Kein korrektes Datum'
    errorTexts.valid = false
  }

  if (!form.postalCode.match(/\d{5}/)) {
    errorTexts.postalCode = 'PLZ muss aus 5 Ziffern bestehen'
    errorTexts.valid = false
  }

  if (form.city.trim() === '') {
    errorTexts.city = 'Fehlt'
    errorTexts.valid = false
  }

  if (form.street.trim() === '') {
    errorTexts.street = 'Fehlt'
    errorTexts.valid = false
  }

  return errorTexts
}

export function privateCustomerFormValidation(form: PrivateCustomerFormState) {
  const errorTexts = { ...DEFAULT_PRIVATE_CUSTOMER_FORM_ERROR_TEXTS }

  if (form.firstName.trim() === '') {
    errorTexts.firstName = 'Fehlt'
    errorTexts.valid = false
  }

  if (form.lastName.trim() === '') {
    errorTexts.lastName = 'Fehlt'
    errorTexts.valid = false
  }

  if (form.postalCode !== '' && form.postalCode.length !== 5) {
    errorTexts.postalCode = 'PLZ muss aus 5 Ziffern bestehen'
    errorTexts.valid = false
  }

  if (form.email.match(/\S+@\S+\.\S+/)?.length !== 1) {
    errorTexts.email = 'Keine korrekte E-Mail'
    errorTexts.valid = false
  }

  if (form.phone !== '' && form.phone.length < 9) {
    errorTexts.phone = 'Tel. muss mind. 9 Ziffern besitzen'
    errorTexts.valid = false
  }

  if (form.grade && !(form.grade > 0 && form.grade < 14)) {
    errorTexts.grade = 'Zwischen 1 und 13 liegen'
    errorTexts.valid = false
  }

  return errorTexts
}

export function schoolFormValidation(form: SchoolFormState) {
  const errorTexts = { ...DEFAULT_SCHOOL_FORM_ERROR_TEXTS }

  if (form.postalCode.trim() !== '' && form.postalCode.length !== 5) {
    errorTexts.postalCode = 'PLZ muss aus 5 Ziffern bestehen'
    errorTexts.valid = false
  }

  if (form.email.match(/\S+@\S+\.\S+/)?.length !== 1) {
    errorTexts.email = 'Keine korrekte E-Mail'
    errorTexts.valid = false
  }

  if (form.phone.trim() !== '' && form.phone.length < 9) {
    errorTexts.phone = 'Tel. muss mind. 9 Ziffern besitzen'
    errorTexts.valid = false
  }

  if (form.schoolName.trim() === '') {
    errorTexts.schoolName = 'Fehlt'
    errorTexts.valid = false
  }

  if (form.dateOfStart !== null && !dayjs(form.dateOfStart).isValid()) {
    errorTexts.dateOfStart = 'Kein korrektes Datum'
    errorTexts.valid = false
  }

  return errorTexts
}

export function subjectFormValidation(form: SubjectFormState) {
  const errorTexts = { ...DEFAULT_SUBJECT_FORM_ERROR_TEXTS }

  if (form.name.trim() === '') {
    errorTexts.name = 'Fehlt'
    errorTexts.valid = false
  }

  if (form.shortForm.trim() === '') {
    errorTexts.shortForm = 'Fehlt'
    errorTexts.valid = false
  }

  return errorTexts
}
