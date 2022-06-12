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
} from '@mui/material'
import Avatar from '@mui/material/Avatar'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import { Dayjs } from 'dayjs'

import subject from '../types/subject'
import { useAuth } from './AuthProvider'
import BetterTimePicker from './BetterTimePicker'
import EqualStack from './EqualStack'

type timeAvailable = {
  id: number
  dow: number | string
  start: Dayjs | null
  end: Dayjs | null
}

type form = {
  firstName: string
  lastName: string
  salutation: string
  city: string
  postalCode: string
  street: string
  email: string
  phone: string
  subjects: subject[]
  fee: number
  timesAvailable: timeAvailable[]
}

type Props = {
  data: form
  setData: (data: form) => void
  times: timeAvailable
  setTimes: (times: timeAvailable) => void
}

const defaultFormData = {
  firstName: '',
  lastName: '',
  salutation: '',
  city: '',
  postalCode: '',
  street: '',
  email: '',
  phone: '',
  subjects: [] as subject[],
  fee: 0,
  timesAvailable: [],
}

const AddTimes: React.FC<Props> = ({ data, setData, times, setTimes }) => {
  const { API } = useAuth()

  const addTime = () => {
    if (times.dow && times.start && times.end) {
      const timesList = data.timesAvailable.concat({
        id: times.id,
        dow: times.dow,
        start: times.start,
        end: times.end,
      })
      setData((data) => ({ ...data, timesAvailable: timesList }))
      setTimes({
        id: times.id + 1,
        dow: '',
        start: null,
        end: null,
      })
    }
  }

  async function deleteTime(id: number) {
    const newTimes = data.timesAvailable.filter((time) => time.id != id)
    setData((data) => ({ ...data, timesAvailable: newTimes }))
  }

  return (
    <>
      <div style={{ display: 'flex' }}>
        <EqualStack
          direction="row"
          spacing={2}
          sx={{ marginTop: '16px', width: '90%' }}
        >
          <FormControl>
            <InputLabel id="SalutationLable">Wochentag</InputLabel>
            <Select
              id="dow"
              label="Wochentag"
              value={times.dow}
              onChange={(event) =>
                //TODO fix types
                setTimes((data) => ({
                  ...data,
                  dow: Number(event.target.value),
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
        </EqualStack>
        <IconButton onClick={addTime} sx={{ width: '10%' }}>
          <AddIcon />
        </IconButton>
      </div>
      <Grid item xs={12} md={6}>
        <List dense={true}>
          {data.timesAvailable.map((time) => {
            const days = [
              'Montag',
              'Dienstag',
              'Mittwoch',
              'Donnerstag',
              'Freitag',
            ]
            const timeText =
              days[Number(time.dow) - 1] +
              ': ' +
              time.start?.format('HH:mm') +
              ' - ' +
              time.end?.format('HH:mm')
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
          })}
        </List>
      </Grid>
    </>
  )
}

export default AddTimes
