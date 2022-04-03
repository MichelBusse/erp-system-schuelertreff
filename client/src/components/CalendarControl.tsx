import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Stack, IconButton } from '@mui/material'
import { Dayjs } from 'dayjs'

type Props = {
  date: Dayjs
  setDate: Function
}

const CalendarControl: React.FC<Props> = ({ date, setDate }) => {
  return (
    <Stack direction="row" spacing={2}>
      <IconButton onClick={() => setDate(date.subtract(1, 'week'))}>
        <ChevronLeftIcon />
      </IconButton>
      <h3>Kalenderwoche {date.week()} {date.year()}</h3>
      <IconButton onClick={() => setDate(date.add(1, 'week'))}>
        <ChevronRightIcon />
      </IconButton>
    </Stack>
  )
}

export default CalendarControl
