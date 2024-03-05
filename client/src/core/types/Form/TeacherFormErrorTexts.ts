import UserFormErrorTexts from "./UserFormErrorTexts"

interface TeacherFormErrorTexts extends UserFormErrorTexts {
  subjects: string
  fee: string
  degree: string
  teacherSchoolTypes: string
  state: string
  iban: string
  bic: string
  bankAccountOwner: string
  bankInstitution: string
  dateOfBirth: string
  dateOfEmploymentStart: string
  dateOfApplication: string
  dateOfApplicationMeeting: string
  applicationLocation: string
}

export default TeacherFormErrorTexts;