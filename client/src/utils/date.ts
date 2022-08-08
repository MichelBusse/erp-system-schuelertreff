import dayjs, { Dayjs } from 'dayjs'

export function minDate(...dates: [Dayjs, ...Dayjs[]]) {
  return dates.reduce((accumulator, curVal) =>
    curVal && accumulator.isBefore(curVal) ? accumulator : curVal,
  )
}

export function maxDate(...dates: [Dayjs, ...Dayjs[]]) {
  return dates.reduce((accumulator, curVal) =>
    curVal && accumulator.isAfter(curVal) ? accumulator : curVal,
  )
}

export function getNextDow(dow: number, date: Dayjs = dayjs()) {
  if (dow < date.day()) dow += 7
  return date.day(dow)
}

export const formatDate = (date: string) => dayjs(date).format('DD.MM.YYYY')
