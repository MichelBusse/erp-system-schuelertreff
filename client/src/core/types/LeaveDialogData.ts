import { Dayjs } from "dayjs"
import { Contract } from "./Contract"
import Leave from "./Leave"
import TimeSuggestion from "./TimeSuggestion"

type LeaveDialogData = {
  contract: Contract
  suggestions: TimeSuggestion[]
  leaves: Record<number, Leave[]>
  minStartDate: Dayjs
  maxEndDate: Dayjs
}

export default LeaveDialogData;