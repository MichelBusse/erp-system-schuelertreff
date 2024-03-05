import { Dayjs } from "dayjs"

type ContractCreationFormState = {
  startDate: Dayjs | null
  endDate: Dayjs | null
  startTime: Dayjs | null
  endTime: Dayjs | null
  minTime: Dayjs | null
  maxTime: Dayjs | null
  teacher: string
  teacherConfirmation: boolean
  dow: number
  selsuggestion: string
}

export default ContractCreationFormState;