import { Dayjs } from "dayjs"

type TeacherDialogFormState = {
  firstName: string
  lastName: string
  email: string
  applicationLocation: string
  dateOfApplication: Dayjs | null
  skip: boolean
}

export default TeacherDialogFormState;