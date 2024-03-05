import TeacherDegree from "../enums/TeacherDegree"
import TeacherSchoolType from "../enums/TeacherSchoolType"
import TeacherState from "../enums/TeacherState"
import UserRole from "../enums/UserRole"
import Subject from "./Subject"
import User from "./User"

interface Teacher extends User {
  role: UserRole.TEACHER
  fee: number
  state: TeacherState
  degree: TeacherDegree
  subjects: Subject[]
  teacherSchoolTypes: TeacherSchoolType[]
  iban: string
  bic: string
  bankAccountOwner: string
  bankInstitution: string
  dateOfBirth: string | null
  dateOfEmploymentStart: string | null
  dateOfApplication: string | null
  dateOfApplicationMeeting: string | null
  applicationLocation: string
}

export default Teacher;