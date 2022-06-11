import 'dayjs/locale/de'

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add'

import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material'

import { Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'

import subject from '../types/subject'
import { teacher } from '../types/user'
import { useAuth } from './AuthProvider'
import BetterTimePicker from './BetterTimePicker'
import EqualStack from './EqualStack'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  setTeachers: (teacher: teacher[]) => void
}

type timeAvailable = {
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
  timesAvailable: []
}

const TeacherDialog: React.FC<Props> = ({ open, setOpen, setTeachers }) => {
  const [data, setData] = useState<form>(defaultFormData)
  const [subjects, setSubjects] = useState<subject[]>([])
  const [times, setTimes] = useState<timeAvailable>({
    dow: '',
    start: null,
    end: null
  })

  const { API } = useAuth()

  useEffect(() => {
    API.get(`subjects`).then((res) => setSubjects(res.data))
  }, [])

  //TODO CG
  // const formValid = !!(
  //   form.customers.length &&
  //   form.subject &&
  //   form.startDate &&
  //   form.startTime &&
  //   form.endTime &&
  //   form.teacher
  // )

  //TODO fix it
  const submitForm = () => {
    console.log(data)
    API.post(`users/teacher`, {
      ...data,
      timesAvailable:
        data.timesAvailable.map((time) => (
          {
            dow: time.dow,
            start: time.start?.format('HH:mm'),
            end: time.end?.format('HH:mm')
          }
        ))
    }).then((res) => {
      setTeachers((s) => [...s, res.data])
      setOpen(false)
      setData(defaultFormData)
    })
  }

  const closeForm = () => {
    setOpen(false)
    setData(defaultFormData)
  }

  const addTime = () => {
    const timesList = data.timesAvailable.concat({
      dow: times.dow,
      start: times.start,
      end: times.end
    })
    
    setData((data) => ({ ...data, timesAvailable: timesList }))
    setTimes({
      dow: 0,
      start: null,
      end: null
    })
  }

  return (
    <Dialog open={open}>
        <DialogTitle>Lehrkraft hinzufügen</DialogTitle>
        <DialogContent>
          <FormControl
            fullWidth
            sx={{ width: '25%', marginRight: '75%', marginTop: '15px' }}
          >
            <InputLabel id="SalutationLable">Anrede *</InputLabel>
            <Select
              id="Salutation"
              label="Anrede"
              value={data.salutation}
              onChange={(event) =>
                setData((data) => ({ ...data, salutation: event.target.value }))
              }
            >
              <MenuItem value="Herr">Herr</MenuItem>
              <MenuItem value="Frau">Frau</MenuItem>
              <MenuItem value="divers">divers</MenuItem>
            </Select>
          </FormControl>
          <TextField
            id="firstName"
            label="Vorname"
            variant="outlined"
            required={true}
            sx={{ margin: '10px', marginLeft: '0px', width: '45%' }}
            value={data.firstName}
            onChange={(event) =>
              setData((data) => ({ ...data, firstName: event.target.value }))
            }
          />
          <TextField
            id="lastName"
            label="Nachname"
            variant="outlined"
            required={true}
            sx={{ margin: '10px', width: '45%' }}
            value={data.lastName}
            onChange={(event) =>
              setData((data) => ({ ...data, lastName: event.target.value }))
            }
          />
          <TextField
            id="city"
            label="Stadt"
            variant="outlined"
            required={true}
            sx={{ margin: '10px', marginLeft: '0px', width: '60%' }}
            value={data.city}
            onChange={(event) =>
              setData((data) => ({ ...data, city: event.target.value }))
            }
          />
          <TextField
            id="postalCode"
            label="Postleitzahl"
            variant="outlined"
            required={true}
            sx={{ margin: '10px', width: '30%' }}
            value={data.postalCode}
            onChange={(event) =>
              setData((data) => ({ ...data, postalCode: event.target.value }))
            }
          />
          <TextField
            id="street"
            label="Straße"
            variant="outlined"
            required={true}
            sx={{ margin: '10px', marginLeft: '0px', width: '94%' }}
            value={data.street}
            onChange={(event) =>
              setData((data) => ({ ...data, street: event.target.value }))
            }
          />
          <TextField
            id="email"
            label="E-Mail Adresse"
            variant="outlined"
            required={true}
            sx={{ margin: '10px', marginLeft: '0px', width: '60%' }}
            value={data.email}
            onChange={(event) =>
              setData((data) => ({ ...data, email: event.target.value }))
            }
          />
          <TextField
            id="phone"
            label="Telefonnummer"
            variant="outlined"
            required={true}
            sx={{ margin: '10px', width: '30%' }}
            value={data.phone}
            onChange={(event) =>
              setData((data) => ({ ...data, phone: event.target.value }))
            }
          />
          <Autocomplete
            multiple
            id="subjects"
            options={subjects}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
              <TextField {...params} variant="standard" label="Fächer *" />
            )}
            value={data.subjects}
            onChange={(_, value) =>
              setData((data) => ({ ...data, subjects: value }))
            }
          />
          <TextField
            type="number"
            id="fee"
            label="Lohn"
            variant="outlined"
            sx={{ marginTop: '20px', width: '15%' }}
            value={data.fee}
            onChange={(event) =>
              setData((data) => ({ ...data, fee: Number(event.target.value) }))
            }
          />

          <EqualStack direction="row" spacing={2}>
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
            <FormControl>
              <InputLabel id="SalutationLable">Wochentag</InputLabel>
              <Select
                id="dow"
                label="Wochentag"
                value={times.dow}
                onChange={(event) => 
                  //TODO fix types
                  setTimes((data) => ({ ...data, dow: Number(event.target.value) }))
                }
              >
                <MenuItem value={1}>Montag</MenuItem>
                <MenuItem value={2}>Dienstag</MenuItem>
                <MenuItem value={3}>Mittwoch</MenuItem>
                <MenuItem value={4}>Donnerstag</MenuItem>
                <MenuItem value={5}>Freitag</MenuItem>
              </Select>
            </FormControl>
            <IconButton
              onClick={addTime}
            >
              <AddIcon />
            </IconButton>
          </EqualStack>
          <Grid item xs={12} md={6}>
            <List dense={true}>
              {data.timesAvailable.map((time) => {
                const days = [
                  'Montag', 
                  'Dienstag', 
                  'Mittwoch', 
                  'Donnerstag', 
                  'Freitag']
                const timeText = days[Number(time.dow) - 1] + ": " + time.start?.format('HH:mm') + " - " + time.end?.format('HH:mm')
                return(
                <ListItem
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete">
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar>
                      <AccessTimeIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={timeText}
                  />
                </ListItem>)})} 
            </List>
        </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeForm}>Abbrechen</Button>
          <Button onClick={submitForm}>Hinzufügen</Button>
        </DialogActions>
      </Dialog>
  )
}

export default TeacherDialog
