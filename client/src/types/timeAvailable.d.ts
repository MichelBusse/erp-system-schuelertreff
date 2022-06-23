import { Dayjs } from 'dayjs'

type timeAvailable = {
  dow: number
  start: Dayjs | null
  end: Dayjs | null
}

export default timeAvailable
