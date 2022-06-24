import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../components/AuthProvider'
import {
  Autocomplete,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material'
import Box from '@mui/material/Box'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { nanoid } from 'nanoid'
import AddTimes from '../components/AddTimes'
import { form } from '../types/form'
import { timesAvailableParsed } from '../types/user'
import styles from '../pages/gridList.module.scss'
import { useSnackbar } from 'notistack'
import { defaultTeacherFormData } from '../consts'
import { formValidation } from '../components/FormValidation'
import subject from '../types/subject'
import { Degree } from '../types/enums'

dayjs.extend(customParseFormat)

const TeacherDetailView: React.FC = () => {
  const { API } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const [subjects, setSubjects] = useState<subject[]>([])

  useEffect(() => {
    API.get(`subjects`).then((res) => setSubjects(res.data))
  }, [])

  let requestedId = id ? id : 'me'

  const [data, setData] = useState<form>(defaultTeacherFormData)
  const [errors, setErrors] = useState(defaultTeacherFormData)

  useEffect(() => {
    API.get('users/teacher/' + requestedId).then((res) => {
      //Convert default value to "Immer verfügbar" in list
      const newTimesAvailable =
        res.data.timesAvailableParsed.length === 1 &&
        res.data.timesAvailableParsed[0].dow === 1 &&
        res.data.timesAvailableParsed[0].start === '00:00' &&
        res.data.timesAvailableParsed[0].end === '00:00'
          ? []
          : res.data.timesAvailableParsed.map((time: timesAvailableParsed) => ({
              dow: time.dow,
              start: dayjs(time.start, 'HH:mm'),
              end: dayjs(time.end, 'HH:mm'),
              id: nanoid(),
            }))

      setData((data) => ({
        ...data,
        firstName: res.data.firstName,
        lastName: res.data.lastName,
        salutation: res.data.salutation,
        city: res.data.city,
        postalCode: res.data.postalCode,
        street: res.data.street,
        email: res.data.email,
        phone: res.data.phone,
        timesAvailable: newTimesAvailable,
        subjects: res.data.subjects,
        degree: res.data.degree
      }))
    })
  }, [])

  const submitForm = () => {
    setErrors(formValidation('teacher', data))

    if (formValidation('teacher', data).validation) {
      API.post('users/teacher/' + requestedId, {
        ...data,
        timesAvailable: data.timesAvailable.map((time) => ({
          dow: time.dow,
          start: time.start?.format('HH:mm'),
          end: time.end?.format('HH:mm'),
        })),
      }).then(() => {
        enqueueSnackbar(data.firstName + ' ' + data.lastName + ' gespeichert')
        if (id) navigate('/teachers')
      })
    }
  }

  const deleteUser = () => {
    console.log('deleteTeacher')
  }

  return (
    <div className={styles.wrapper}>
      <Box
        sx={{
          flexGrow: 1,
          backgroundColor: '#ffffff',
          padding: '30px',
          boxSizing: 'border-box',
          borderRadius: '25px',
        }}
      >
        <Stack direction="column" alignItems={'stretch'}>
          <h3>Person:</h3>
          <Stack direction="row" columnGap={2}>
            <FormControl fullWidth sx={{ width: '240px' }}>
              <InputLabel id="SalutationLable">Anrede *</InputLabel>
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
                disabled={requestedId === 'me'}
              >
                <MenuItem value="Herr">Herr</MenuItem>
                <MenuItem value="Frau">Frau</MenuItem>
                <MenuItem value="divers">divers</MenuItem>
              </Select>
              <FormHelperText>{errors.salutation}</FormHelperText>
            </FormControl>
            <TextField
              helperText={errors.firstName}
              fullWidth={true}
              label="Vorname"
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  firstName: event.target.value,
                }))
              }
              value={data.firstName}
              InputProps={{
                readOnly: requestedId === 'me',
              }}
            />
            <TextField
              helperText={errors.lastName}
              fullWidth={true}
              label="Nachname"
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  lastName: event.target.value,
                }))
              }
              value={data.lastName}
              InputProps={{
                readOnly: requestedId === 'me',
              }}
            />
          </Stack>
          <h3>Adresse:</h3>
          <Stack direction="row" columnGap={2}>
            <TextField
              helperText={errors.street}
              label="Straße"
              fullWidth={true}
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  street: event.target.value,
                }))
              }
              value={data.street}
              InputProps={{
                readOnly: false,
              }}
            />
            <TextField
              label="Stadt"
              helperText={errors.city}
              fullWidth={true}
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  city: event.target.value,
                }))
              }
              value={data.city}
              InputProps={{
                readOnly: false,
              }}
            />
            <TextField
              label="Postleitzahl"
              sx={{ width: '300px' }}
              helperText={errors.postalCode}
              fullWidth={true}
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  postalCode: event.target.value,
                }))
              }
              value={data.postalCode}
              InputProps={{
                readOnly: false,
              }}
            />
          </Stack>
          <h3>Kontakt:</h3>
          <Stack direction="row" columnGap={2}>
            <TextField
              fullWidth={true}
              helperText={errors.email}
              label="Email"
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  email: event.target.value,
                }))
              }
              value={data.email}
              InputProps={{
                readOnly: requestedId === 'me',
              }}
            />

            <TextField
              fullWidth={true}
              helperText={errors.phone}
              label="Telefonnummer"
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  phone: event.target.value,
                }))
              }
              value={data.phone}
            />
          </Stack>
          <h3>Lehrerdaten:</h3>
          <Stack direction={'row'} columnGap={2}>
            <FormControl sx={{ width: '300px' }}>
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
            <Autocomplete
              fullWidth
              multiple
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
          <h3>Verfügbarkeit:</h3>
          <Box>
            <AddTimes data={data} setData={setData} />
          </Box>
          <Stack direction={'row'} columnGap={5} sx={{ marginTop: '15px' }}>
            {id && (
              <Button
                onClick={() => {
                  navigate('/teachers')
                }}
                variant="outlined"
              >
                Abbrechen
              </Button>
            )}
            <Button onClick={submitForm} variant="contained">
              Speichern
            </Button>
            {id && (
              <Button
                variant="outlined"
                onClick={deleteUser}
                sx={{ marginLeft: 'auto' }}
                color="error"
              >
                Entfernen
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>
    </div>
  )
}

export default TeacherDetailView
