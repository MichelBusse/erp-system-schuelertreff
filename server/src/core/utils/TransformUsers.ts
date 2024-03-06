import { User } from "src/features/users/entities/user.entity"
import { TimeSlot } from "../models/TimeSlot"
import { parseTimeSlot } from "./TimeSlotUtils"

export function transformUser<U extends User>(
  user: U,
): U & { timesAvailableParsed: TimeSlot[] } {
  return {
    ...user,
    timesAvailableParsed: parseTimeSlot(user.timesAvailable),
  }
}

export function transformUsers<U extends User>(users: U[]) {
  return users.map(transformUser)
}