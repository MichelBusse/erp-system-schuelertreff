import { Dayjs } from 'dayjs'

type timeAvailable = {
  dow: number | string
  start: Dayjs | null
  end: Dayjs | null
}

export default timeAvailable
