import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft'
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight'
import { IconButton } from '@mui/material'
import { Dayjs } from 'dayjs'
import CalendarControlStack from '../CalendarControlStack'

type Props = {
  date: Dayjs
  setDate: (open: Dayjs) => void
}

const CalendarControl: React.FC<Props> = ({ date, setDate }) => {
  return (
    <CalendarControlStack direction="row" spacing={1}>
      <IconButton onClick={() => setDate(date.subtract(1, 'week'))}>
        <KeyboardDoubleArrowLeftIcon fontSize="large" htmlColor="#CDFF4E" />
      </IconButton>
      <h4>Kalenderwoche {date.week()}</h4>
      <IconButton onClick={() => setDate(date.add(1, 'week'))}>
        <KeyboardDoubleArrowRightIcon fontSize="large" htmlColor="#CDFF4E" />
      </IconButton>
    </CalendarControlStack>
  )
}

export default CalendarControl
