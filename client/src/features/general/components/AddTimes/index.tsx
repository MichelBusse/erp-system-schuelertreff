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
import dayjs, { Dayjs } from 'dayjs'
import { nanoid } from 'nanoid'
import { useState } from 'react'
import BetterTimePicker from '../BetterTimePicker'
import TimeSlot from '../../../../core/types/TimeSlot'

type times = {
  dow: string
  start: Dayjs | null
  end: Dayjs | null
}

type Props = {
  value: TimeSlot[]
  setValue: (newValue: TimeSlot[]) => void
}

const AddTimes: React.FC<Props> = ({ value, setValue }) => {
  const [times, setTimes] = useState<times>({
    dow: '',
    start: null,
    end: null,
  })
  const addTime = () => {
    if (times.dow && times.start && times.end) {
      setValue([
        ...value,
        {
          id: nanoid(),
          dow: parseInt(times.dow),
          start: times.start,
          end: times.end,
        },
      ])

      setTimes({
        dow: '',
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
              value={times.dow}
              onChange={(event) =>
                //TODO fix types
                setTimes((data) => ({
                  ...data,
                  dow: event.target.value,
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
            maxTime={times.end?.subtract(30, 'm')}
            value={times.start}
            onChange={(value) => {
              setTimes((data) => ({ ...data, start: value }))
            }}
            clearValue={() => {
              setTimes((data) => ({ ...data, start: null }))
            }}
          />
          <BetterTimePicker
            fullWidth
            label="Endzeit"
            minutesStep={5}
            required={true}
            minTime={times.start?.add(30, 'm')}
            value={times.end}
            onChange={(value) => {
              setTimes((data) => ({ ...data, end: value }))
            }}
            clearValue={() => {
              setTimes((data) => ({ ...data, end: null }))
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
