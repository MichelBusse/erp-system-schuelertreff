import dayjs from "dayjs"
import { privateCustomerForm, privateCustomerFormErrorTexts, schoolForm, schoolFormErrorTexts, subjectForm, subjectFormErrorTexts, teacherForm, teacherFormErrorTexts } from "../types/form"

export const testEmail = (email: string) => /.+@.+\.[A-Za-z]+$/.test(email)


export const defaultTeacherFormErrorTexts : teacherFormErrorTexts = {
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
} 

export function teacherFormValidation(form: teacherForm) : teacherFormErrorTexts {
  const errorTexts = {...defaultTeacherFormErrorTexts}


  if(form.firstName.trim() === ''){
    errorTexts.firstName = 'Fehlt'
    errorTexts.valid = false
  }

  if(form.lastName.trim() === ''){
    errorTexts.lastName = 'Fehlt'
    errorTexts.valid = false
  }

  if(form.postalCode !== '' && form.postalCode.length !== 5){
    errorTexts.postalCode = 'PLZ muss aus 5 Ziffern bestehen'
    errorTexts.valid = false
  }

  if(form.email.match(/\S+@\S+\.\S+/)?.length !== 1 ){
    errorTexts.email = 'Keine korrekte E-Mail'
    errorTexts.valid = false
  }

  if(form.phone !== '' && form.phone.length < 9){
    errorTexts.phone = 'Tel. muss mind. 9 Ziffern besitzen'
    errorTexts.valid = false
  }

  if(form.iban !== '' && form.iban.length !== 22){
    errorTexts.iban = 'IBAN muss 22 Zeichen besitzen'
    errorTexts.valid = false
  }

  if(form.dateOfBirth !== null && !dayjs(form.dateOfBirth).isValid()){
    errorTexts.dateOfBirth = 'Kein korrektes Datum'
    errorTexts.valid = false
  }

  if(form.dateOfEmploymentStart !== null && !dayjs(form.dateOfEmploymentStart).isValid()){
    errorTexts.dateOfEmploymentStart = 'Kein korrektes Datum'
    errorTexts.valid = false
  }

  return errorTexts
}

export const defaultPrivateCustomerFormErrorTexts : privateCustomerFormErrorTexts = {
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

export function privateCustomerFormValidation(form: privateCustomerForm) : privateCustomerFormErrorTexts {
  const errorTexts = {...defaultPrivateCustomerFormErrorTexts}

  if(form.firstName.trim() === ''){
    errorTexts.firstName = 'Fehlt'
    errorTexts.valid = false
  }

  if(form.lastName.trim() === ''){
    errorTexts.lastName = 'Fehlt'
    errorTexts.valid = false
  }

  if(form.postalCode !== '' && form.postalCode.length !== 5){
    errorTexts.postalCode = 'PLZ muss aus 5 Ziffern bestehen'
    errorTexts.valid = false
  }

  if(form.email.match(/\S+@\S+\.\S+/)?.length !== 1 ){
    errorTexts.email = 'Keine korrekte E-Mail'
    errorTexts.valid = false
  }

  if(form.phone !== '' && form.phone.length < 9){
    errorTexts.phone = 'Tel. muss mind. 9 Ziffern besitzen'
    errorTexts.valid = false
  }

  if(form.grade && !(form.grade > 0 && form.grade < 14)){
    errorTexts.grade = 'Zwischen 1 und 13 liegen'
    errorTexts.valid = false
  }

  return errorTexts
}

export const defaultSchoolFormErrorTexts : schoolFormErrorTexts = {
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
  valid: true,
} 

export function schoolFormValidation(form: schoolForm) : schoolFormErrorTexts {
  const errorTexts = {...defaultSchoolFormErrorTexts}

  if(form.postalCode !== '' && form.postalCode.length !== 5){
    errorTexts.postalCode = 'PLZ muss aus 5 Ziffern bestehen'
    errorTexts.valid = false
  }

  if(form.email.match(/\S+@\S+\.\S+/)?.length !== 1 ){
    errorTexts.email = 'Keine korrekte E-Mail'
    errorTexts.valid = false
  }

  if(form.phone !== '' && form.phone.length < 9){
    errorTexts.phone = 'Tel. muss mind. 9 Ziffern besitzen'
    errorTexts.valid = false
  }

  if(form.schoolName.trim() === ''){
    errorTexts.schoolName = 'Fehlt'
    errorTexts.valid = false
  }

  return errorTexts
}

export const defaultSubjectFormErrorTexts = {
  color: '',
  name: '',
  shortForm: '',
  valid: true
}

export function subjectFormValidation(form: subjectForm) : subjectFormErrorTexts {
  const errorTexts = {...defaultSubjectFormErrorTexts}

  if(form.name.trim() === ''){
    errorTexts.name = "Fehlt"
    errorTexts.valid = false
  }

  if(form.shortForm.trim() === ''){
    errorTexts.shortForm = "Fehlt"
    errorTexts.valid = false
  }

  return errorTexts
}
