import { Dayjs } from "dayjs"
import LeaveState from "../../enums/LeaveState"
import LeaveType from "../../enums/LeaveType"

type LeaveFormState = {
  id?: number
  type: LeaveType
  state: LeaveState
  startDate: Dayjs | null
  endDate: Dayjs | null
  hasAttachment: boolean
}

export default LeaveFormState;