import 'dayjs/locale/de'

import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  FormLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material'
import { useEffect, useState } from 'react'

import { defaultTeacherFormData } from '../consts'
import { Degree, SchoolType } from '../types/enums'
import { teacherForm } from '../types/form'
import subject from '../types/subject'
import { teacher } from '../types/user'
import AddTimes from './AddTimes'
import { useAuth } from './AuthProvider'
import { formValidation } from './FormValidation'

type Props = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  setTeachers: React.Dispatch<React.SetStateAction<teacher[]>>
}

const TeacherDialog: React.FC<Props> = ({ open, setOpen, setTeachers }) => {
  const [data, setData] = useState<teacherForm>(defaultTeacherFormData)
  const [subjects, setSubjects] = useState<subject[]>([])
  const [errors, setErrors] = useState(defaultTeacherFormData)

  const { API } = useAuth()

  useEffect(() => {
    API.get(`subjects`).then((res) => setSubjects(res.data))
  }, [])

  const submitForm = () => {
    setErrors(formValidation('teacher', data))

    if (formValidation('teacher', data).validation)
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
        setData(defaultTeacherFormData)
      })
  }

  const closeForm = () => {
    setOpen(false)
    setData(defaultTeacherFormData)
    setErrors(defaultTeacherFormData)
  }

  return (
    <Dialog open={open}>
      <DialogTitle>Lehrkraft hinzufügen</DialogTitle>
      <DialogContent sx={{ boxSizing: 'border-box' }}>
        <Stack
          direction={'column'}
          rowGap={3}
          alignItems={'stretch'}
          sx={{ paddingTop: '15px' }}
        >
          <Stack direction={'row'} columnGap={2}>
            <FormControl sx={{ width: '240px' }}>
              <InputLabel id="SalutationLable">Anrede</InputLabel>
              <Select
                id="Salutation"
                label="Anrede"
                value={data.salutation}
                onChange={(event) =>
                  setData((data) => ({
                    ...data,
                    salutation: event.target.value,
                  }))
                }
              >
                <MenuItem value="Herr">Herr</MenuItem>
                <MenuItem value="Frau">Frau</MenuItem>
                <MenuItem value="divers">divers</MenuItem>
              </Select>
              <FormHelperText>{errors.salutation}</FormHelperText>
            </FormControl>
            <TextField
              helperText={errors.firstName}
              id="firstName"
              label="Vorname"
              variant="outlined"
              required={true}
              fullWidth
              value={data.firstName}
              onChange={(event) =>
                setData((data) => ({ ...data, firstName: event.target.value }))
              }
            />
            <TextField
              helperText={errors.lastName}
              id="lastName"
              label="Nachname"
              variant="outlined"
              required={true}
              fullWidth
              value={data.lastName}
              onChange={(event) =>
                setData((data) => ({ ...data, lastName: event.target.value }))
              }
            />
          </Stack>
          <Stack direction={'row'} columnGap={2}>
            <TextField
              fullWidth
              helperText={errors.city}
              id="city"
              label="Stadt"
              variant="outlined"
              required={true}
              value={data.city}
              onChange={(event) =>
                setData((data) => ({ ...data, city: event.target.value }))
              }
            />
            <TextField
              helperText={errors.postalCode}
              id="postalCode"
              label="Postleitzahl"
              variant="outlined"
              required={true}
              sx={{ width: '300px' }}
              value={data.postalCode}
              onChange={(event) =>
                setData((data) => ({ ...data, postalCode: event.target.value }))
              }
            />
          </Stack>
          <Stack direction={'row'} columnGap={2}>
            <TextField
              fullWidth
              helperText={errors.street}
              id="street"
              label="Straße"
              variant="outlined"
              required={true}
              value={data.street}
              onChange={(event) =>
                setData((data) => ({ ...data, street: event.target.value }))
              }
            />
          </Stack>
          <Stack direction={'row'} columnGap={2}>
            <TextField
              fullWidth
              helperText={errors.email}
              id="email"
              label="E-Mail Adresse"
              variant="outlined"
              required={true}
              value={data.email}
              onChange={(event) =>
                setData((data) => ({ ...data, email: event.target.value }))
              }
            />
            <TextField
              helperText={errors.phone}
              id="phone"
              label="Telefonnummer"
              variant="outlined"
              required={true}
              value={data.phone}
              sx={{ width: '50%' }}
              onChange={(event) =>
                setData((data) => ({ ...data, phone: event.target.value }))
              }
            />
          </Stack>
          <Stack direction={'row'} columnGap={2}>
            <Autocomplete
              fullWidth
              multiple
              id="schoolTypes"
              options={[
                SchoolType.GRUNDSCHULE,
                SchoolType.OBERSCHULE,
                SchoolType.GYMSEK1,
                SchoolType.GYMSEK2,
              ]}
              getOptionLabel={(option) => {
                switch (option) {
                  case SchoolType.GRUNDSCHULE:
                    return 'Grundschule'
                  case SchoolType.OBERSCHULE:
                    return 'Oberschule'
                  case SchoolType.GYMSEK1:
                    return 'Gymnasium Sek. 1'
                  case SchoolType.GYMSEK2:
                    return 'Gymnasium Sek. 2'
                  default:
                    return ''
                }
              }}
              renderInput={(params) => (
                <TextField {...params} variant="outlined" label="Schularten" />
              )}
              value={data.schoolTypes}
              onChange={(_, value) =>
                setData((data) => ({ ...data, schoolTypes: value }))
              }
            />
          </Stack>
          <Stack direction={'row'} columnGap={2}>
            <Autocomplete
              multiple
              fullWidth
              id="subjects"
              options={subjects}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField {...params} variant="outlined" label="Fächer *" />
              )}
              value={data.subjects}
              onChange={(_, value) =>
                setData((data) => ({ ...data, subjects: value }))
              }
            />
          </Stack>
          <Stack direction="row" columnGap={2}>
            <TextField
              type="number"
              id="fee"
              label="Lohn"
              variant="outlined"
              sx={{ width: '100px' }}
              value={data.fee}
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  fee: Number(event.target.value),
                }))
              }
            />
            <FormControl fullWidth>
              <InputLabel id="DegreeLable">Höchster Abschluss</InputLabel>
              <Select
                id="Degree"
                label="Höchster Abschluss"
                value={data.degree}
                required
                onChange={(event) =>
                  setData((data) => ({
                    ...data,
                    degree: event.target.value,
                  }))
                }
              >
                <MenuItem value={Degree.NOINFO}>Keine Angabe</MenuItem>
                <MenuItem value={Degree.HIGHSCHOOL}>Abitur</MenuItem>
                <MenuItem value={Degree.BACHELOR}>Bachelor</MenuItem>
                <MenuItem value={Degree.MASTER}>Master</MenuItem>
              </Select>
              <FormHelperText>{errors.degree}</FormHelperText>
            </FormControl>
          </Stack>
          <FormControl sx={{ marginTop: '10px' }}>
            <FormLabel>Verfügbarkeit</FormLabel>
            <AddTimes data={data} setData={setData} />
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeForm}>Abbrechen</Button>
        <Button onClick={submitForm}>Hinzufügen</Button>
      </DialogActions>
    </Dialog>
  )
}

export default TeacherDialog
