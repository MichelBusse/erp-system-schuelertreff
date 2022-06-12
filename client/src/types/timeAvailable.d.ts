import { Dayjs } from 'dayjs'

type timeAvailable = {
  id: number
  dow: number | string
  start: Dayjs | null
  end: Dayjs | null
}

export default timeAvailable
