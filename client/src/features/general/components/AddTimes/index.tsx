import 'dayjs/locale/de'

import AccessTimeIcon from '@mui/icons-material/AccessTime'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import {
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from '@mui/material'
import Avatar from '@mui/material/Avatar'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import dayjs from 'dayjs'
import { nanoid } from 'nanoid'
import { useState } from 'react'
import BetterTimePicker from '../BetterTimePicker'
import TimeSlot from '../../../../core/types/TimeSlot'

type Props = {
  value: TimeSlot[]
  setValue: (newValue: TimeSlot[]) => void
}

const AddTimes: React.FC<Props> = ({ value, setValue }) => {
  const [timeSlot, setTimeSlot] = useState<TimeSlot>({
    id: nanoid(),
    dow: 0,
    start: null,
    end: null,
  })
  const addTime = () => {
    if (timeSlot.dow != 0 && timeSlot.start && timeSlot.end) {
      setValue([
        ...value,
        timeSlot,
      ])

      setTimeSlot({
        id: nanoid(),
        dow: 0,
        start: null,
        end: null,
      })
    }
  }

  async function deleteTime(id: string) {
    setValue(value.filter((time) => time.id !== id))
  }

  const elements = value.map((time) => {
    const timeText =
      `${dayjs().day(time.dow).format('dddd')}: ` +
      `${time.start?.format('HH:mm')} - ${time.end?.format('HH:mm')}`

    return (
      <ListItem
        key={time.id}
        secondaryAction={
          <IconButton
            edge="end"
            aria-label="delete"
            onClick={() => deleteTime(time.id)}
          >
            <DeleteIcon />
          </IconButton>
        }
      >
        <ListItemAvatar>
          <Avatar>
            <AccessTimeIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={timeText} />
      </ListItem>
    )
  })

  return (
    <>
      <Stack direction="row" spacing={2} justifyContent={'space-between'}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexGrow={1}>
          <FormControl fullWidth>
            <InputLabel id="DowLable">Wochentag</InputLabel>
            <Select
              id="dow"
              label="Wochentag"
              value={timeSlot.dow}
              onChange={(event) =>
                setTimeSlot((data) => ({
                  ...data,
                  dow: event.target.value as number,
                }))
              }
            >
              <MenuItem value={1}>Montag</MenuItem>
              <MenuItem value={2}>Dienstag</MenuItem>
              <MenuItem value={3}>Mittwoch</MenuItem>
              <MenuItem value={4}>Donnerstag</MenuItem>
              <MenuItem value={5}>Freitag</MenuItem>
            </Select>
          </FormControl>
          <BetterTimePicker
            fullWidth
            label="Startzeit"
            minutesStep={5}
            required={true}
            maxTime={timeSlot.end?.subtract(30, 'm')}
            value={timeSlot.start}
            onChange={(value) => {
              setTimeSlot((data) => ({ ...data, start: value }))
            }}
            clearValue={() => {
              setTimeSlot((data) => ({ ...data, start: null }))
            }}
          />
          <BetterTimePicker
            fullWidth
            label="Endzeit"
            minutesStep={5}
            required={true}
            minTime={timeSlot.start?.add(30, 'm')}
            value={timeSlot.end}
            onChange={(value) => {
              setTimeSlot((data) => ({ ...data, end: value }))
            }}
            clearValue={() => {
              setTimeSlot((data) => ({ ...data, end: null }))
            }}
          />
        </Stack>
        <IconButton onClick={addTime} sx={{ alignSelf: 'center' }}>
          <AddIcon />
        </IconButton>
      </Stack>
      <Grid item>
        <List
          dense={true}
          sx={{
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            margin: '5px 0',
          }}
        >
          {elements.length > 0 ? (
            elements
          ) : (
            <ListItem key={1}>
              <ListItemText primary={'Immer verfügbar'} />
            </ListItem>
          )}
        </List>
      </Grid>
    </>
  )
}

export default AddTimes
