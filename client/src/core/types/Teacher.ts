import TeacherDegree from "../enums/TeacherDegree.enum"
import TeacherSchoolType from "../enums/TeacherSchoolType.enum"
import TeacherState from "../enums/TeacherState.enum"
import UserRole from "../enums/UserRole.enum"
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