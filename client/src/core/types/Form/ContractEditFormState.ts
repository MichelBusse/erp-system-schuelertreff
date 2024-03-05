import { Dayjs } from "dayjs"
import Customer from "../Customer"
import Teacher from "../Teacher"
import Subject from "../Subject"

type ContractEditFormState = {
  startDate: Dayjs | null
  endDate: Dayjs | null
  startTime: Dayjs | null
  endTime: Dayjs | null
  teacher: Teacher | null
  dow: number | null
  interval: number
  customers: Customer[]
  subject: Subject | null
}

export default ContractEditFormState;