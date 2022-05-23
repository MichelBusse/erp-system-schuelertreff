import { Stack, IconButton } from '@mui/material'
import { styled } from '@mui/system'
import { Dayjs } from 'dayjs'
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft'
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight'

type Props = {
  date: Dayjs
  setDate: (open: Dayjs) => void
}

//Styling:
const StyledStack = styled(Stack, {})({
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

//Component:
const CalendarControl: React.FC<Props> = ({ date, setDate }) => {
  return (
    <StyledStack direction="row" spacing={1}>
      <IconButton onClick={() => setDate(date.subtract(1, 'week'))}>
        <KeyboardDoubleArrowLeftIcon fontSize="large" htmlColor="#CDFF4E" />
      </IconButton>
      <h4>Kalenderwoche {date.week()}</h4>
      <IconButton onClick={() => setDate(date.add(1, 'week'))}>
        <KeyboardDoubleArrowRightIcon fontSize="large" htmlColor="#CDFF4E" />
      </IconButton>
    </StyledStack>
  )
}

export default CalendarControl
