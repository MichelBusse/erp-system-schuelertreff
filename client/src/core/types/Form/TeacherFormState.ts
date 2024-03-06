import { Dayjs } from "dayjs"
import TeacherState from "../../enums/TeacherState.enum"
import Subject from "../Subject"
import UserFormState from "./UserFormState"

interface TeacherFormState extends UserFormState {
  subjects: Subject[]
  fee: number | null
  degree: string
  teacherSchoolTypes: string[]
  state: TeacherState
  iban: string
  bic: string
  bankAccountOwner: string
  bankInstitution: string
  dateOfBirth: Dayjs | null
  dateOfEmploymentStart: Dayjs | null
  dateOfApplication: Dayjs | null
  dateOfApplicationMeeting: Dayjs | null
  applicationLocation: string
}

export default TeacherFormState;