import 'dayjs/locale/de'

import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material'

import { useEffect, useState } from 'react'

import subject from '../types/subject'
import { teacher } from '../types/user'
import { useAuth } from './AuthProvider'
import AddTimes from './AddTimes'
import timeAvailable from '../types/timeAvailable'
import form from '../types/defaultFormData'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  setTeachers: (teacher: teacher[]) => void
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

const TeacherDialog: React.FC<Props> = ({ open, setOpen, setTeachers }) => {
  const [data, setData] = useState<form>(defaultFormData)
  const [subjects, setSubjects] = useState<subject[]>([])
  const [times, setTimes] = useState<timeAvailable>({
    id: 1,
    dow: '',
    start: null,
    end: null,
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
      timesAvailable: data.timesAvailable.map((time) => ({
        dow: time.dow,
        start: time.start?.format('HH:mm'),
        end: time.end?.format('HH:mm'),
      })),
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
    if (
      times.dow &&
      times.start &&
      times.end
    ) {
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

  async function deleteTime(id: number){
    let newTimes = data.timesAvailable.filter(time => time.id != id)
    setData((data) => ({ ...data, timesAvailable: newTimes }))
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
        <AddTimes 
          data = {data}
          setData = {setData}
          times = {times}
          setTimes = {setTimes}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={closeForm}>Abbrechen</Button>
        <Button onClick={submitForm}>Hinzufügen</Button>
      </DialogActions>
    </Dialog>
  )
}

export default TeacherDialog
