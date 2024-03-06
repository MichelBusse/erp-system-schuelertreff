import dayjs from "dayjs"
import { TimeSlot } from "../models/TimeSlot"
import { MAX_TIME_RANGE } from "../res/Constants"

/**
 * Parse Postgres `tstzmultirange` literal to Array of {@link TimeSlot}
 */
export function parseTimeSlot(multirange: string): TimeSlot[] {
  const regex = /\["?([^",]*)"?, ?"?([^",]*)"?\)/g

  return [...multirange.matchAll(regex)].map((range) => {
    const start = dayjs(range[1].substring(0, 16))
    const end = dayjs(range[2].substring(0, 16))

    return {
      start: start.format('HH:mm'),
      end: end.day() > start.day() ? '24:00' : end.format('HH:mm'),
      dow: start.day(),
    }
  })
}

/**
 * Format Array of {@link timeAvailable} as Postgres `tstzmultirange`
 */
export function parseTSTZMultirange(times: TimeSlot[]) {
  if (times.length === 0) return `{${MAX_TIME_RANGE}}`

  return `{${times
    .map((t) => {
      const date = dayjs('2001-01-01').day(t.dow).format('YYYY-MM-DD')
      return `[${date} ${t.start}, ${date} ${t.end})` // exclusive upper bound
    })
    .join(', ')}}`
}