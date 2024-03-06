import LeaveState from "../enums/LeaveState.enum"
import LeaveType from "../enums/LeaveType.enum"

type Leave = {
  id: number
  type: LeaveType
  state: LeaveState
  startDate: string
  endDate: string
  hasAttachment: boolean
  user: {
    id: number
    firstName: string
    lastName: string
  }
}

export default Leave;