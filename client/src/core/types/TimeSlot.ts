import { Dayjs } from 'dayjs'

type TimeSlot = {
  id: string
  dow: number
  start: Dayjs | null
  end: Dayjs | null
}

export default TimeSlot
