import { Dayjs } from 'dayjs'

type timeAvailable = {
  id: string
  dow: number
  start: Dayjs | null
  end: Dayjs | null
}

export default timeAvailable
