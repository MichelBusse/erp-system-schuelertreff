import LeaveState from "../enums/LeaveState"
import LeaveType from "../enums/LeaveType"

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