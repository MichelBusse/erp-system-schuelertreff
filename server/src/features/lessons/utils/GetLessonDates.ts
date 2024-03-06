import dayjs, { Dayjs } from "dayjs"
import { getNextDow, maxDate, minDate } from "src/core/utils/DateUtils"
import { Contract } from "src/features/contracts/entities/Contract.entity"

export function getLessonDates(
  contract: Contract,
  startDate: Dayjs,
  endDate: Dayjs,
): Dayjs[] {
  const dow = dayjs(contract.startDate).day()
  const start = maxDate(dayjs(contract.startDate), startDate)
  const end = minDate(dayjs(contract.endDate), endDate)

  const dates: Dayjs[] = []

  for (
    let i = getNextDow(dow, start);
    !i.isAfter(end);
    i = i.add(contract.interval, 'week')
  ) {
    dates.push(i)
  }

  return dates
}