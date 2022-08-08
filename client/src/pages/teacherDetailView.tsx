import CheckIcon from '@mui/icons-material/Check'
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { nanoid } from 'nanoid'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import AddTimes from '../components/AddTimes'
import { useAuth } from '../components/AuthProvider'
import InvoiceDataSelect from '../components/InvoiceDateSelect'
import Leave from '../components/Leave'
import UserDocuments from '../components/UserDocuments'
import {
  defaultTeacherFormData,
  snackbarOptions,
  snackbarOptionsError,
  teacherStateToString,
} from '../consts'
import styles from '../pages/gridList.module.scss'
import { Degree, SchoolType, TeacherState } from '../types/enums'
import { teacherForm } from '../types/form'
import subject from '../types/subject'
import { leave, teacher, timesAvailableParsed } from '../types/user'
import { formValidation } from '../utils/formValidation'

dayjs.extend(customParseFormat)

const TeacherDetailView: React.FC = () => {
  const { API, decodeToken } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()

  const [subjects, setSubjects] = useState<subject[]>([])
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [data, setData] = useState<teacherForm>(defaultTeacherFormData)
  const [leaveData, setLeaveData] = useState<leave[]>([])
  const [errors, setErrors] = useState(defaultTeacherFormData)

  const requestedId = id ?? 'me'
  const activeTeacherState = decodeToken().state

  // refresh data if teacher state is updated (i.e. application accepted)
  useEffect(() => {
    API.get(`subjects`).then((res) => setSubjects(res.data))
    API.get('users/teacher/' + requestedId).then((res) => updateData(res.data))
  }, [activeTeacherState])

  const updateData = (newData: teacher) => {
    //Convert default value to "Immer verfügbar" in list
    const newTimesAvailable =
      newData.timesAvailableParsed.length === 1 &&
      newData.timesAvailableParsed[0].dow === 1 &&
      newData.timesAvailableParsed[0].start === '00:00' &&
      newData.timesAvailableParsed[0].end === '00:00'
        ? []
        : newData.timesAvailableParsed.map((time: timesAvailableParsed) => ({
            dow: time.dow,
            start: dayjs(time.start, 'HH:mm'),
            end: dayjs(time.end, 'HH:mm'),
            id: nanoid(),
          }))

    setData({
      firstName: newData.firstName,
      lastName: newData.lastName,
      city: newData.city,
      postalCode: newData.postalCode,
      street: newData.street,
      email: newData.email,
      phone: newData.phone,
      subjects: newData.subjects,
      degree: newData.degree,
      schoolTypes: newData.schoolTypes,
      state: newData.state,
      fee: newData.fee,
      timesAvailable: newTimesAvailable,
    })

    setLeaveData(newData.leave)
  }

  const submitForm = (override: Partial<teacherForm> = {}) => {
    setErrors(formValidation('teacher', data))

    if (formValidation('teacher', data).validation) {
      API.post('users/teacher/' + requestedId, {
        ...data,
        ...override,
        timesAvailable: data.timesAvailable.map((time) => ({
          dow: time.dow,
          start: time.start?.format('HH:mm'),
          end: time.end?.format('HH:mm'),
        })),
      }).then((res) => {
        enqueueSnackbar(
          data.firstName + ' ' + data.lastName + ' gespeichert',
          snackbarOptions,
        )

        updateData(res.data)

        if (id) navigate('/teachers')
      })
    }
  }

  const deleteUser = () => {
    setDialogOpen(false)

    API.delete('users/teacher/' + requestedId)
      .then(() => {
        enqueueSnackbar(
          data.firstName + ' ' + data.lastName + ' gelöscht',
          snackbarOptions,
        )
        navigate('/teachers')
      })
      .catch(() => {
        enqueueSnackbar(
          data.firstName +
            ' ' +
            data.lastName +
            ' kann nicht gelöscht werden, da noch laufende Verträge existieren.',
          snackbarOptionsError,
        )
      })
  }

  const generateInvoice = (year: number, month: number) => {
    API.get('lessons/invoice/teacher', {
      params: {
        of: dayjs().year(year).month(month).format('YYYY-MM-DD'),
        teacherId: id,
      },
      responseType: 'blob',
    })
      .then((res) => {
        window.open(URL.createObjectURL(res.data))
      })
      .catch(() => {
        enqueueSnackbar('Ein Fehler ist aufgetreten', snackbarOptionsError)
      })
  }

  return (
    <div className={styles.wrapper} style={{ minHeight: '100vh' }}>
      <Box
        sx={{
          flexGrow: 1,
          backgroundColor: '#ffffff',
          padding: '30px',
          boxSizing: 'border-box',
          borderRadius: '25px',
        }}
      >
        <Stack direction="column" alignItems="stretch" spacing={2}>
          <Typography variant="h6">Person:</Typography>
          <Stack direction="row" columnGap={2}>
            <TextField
              helperText={errors.firstName}
              fullWidth={true}
              label="Vorname"
              disabled={requestedId === 'me'}
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
              disabled={requestedId === 'me'}
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
          <Typography variant="h6">Adresse:</Typography>
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
          <Typography variant="h6">Kontakt:</Typography>
          <Stack direction="row" columnGap={2}>
            <TextField
              fullWidth={true}
              helperText={errors.email}
              label="Email"
              disabled
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
          <Typography variant="h6">Lehrkraftdaten:</Typography>
          <Stack direction={'column'} rowGap={2}>
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
            <Stack direction={'row'} columnGap={2}>
              <FormControl fullWidth>
                <InputLabel id="DegreeLable">Höchster Abschluss</InputLabel>
                <Select
                  id="Degree"
                  label="Höchster Abschluss"
                  disabled={requestedId === 'me'}
                  value={data.degree}
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
              <TextField
                type="number"
                id="fee"
                label="Stundensatz"
                variant="outlined"
                disabled={requestedId === 'me'}
                value={data.fee ?? ''}
                onChange={(event) =>
                  setData((data) => ({
                    ...data,
                    fee: Number(event.target.value),
                  }))
                }
              />
            </Stack>
            {requestedId !== 'me' && (
              <Typography>
                Status: {teacherStateToString[data.state]}
              </Typography>
            )}
          </Stack>

          <Typography variant="h6">Verfügbarkeit:</Typography>
          <Box>
            <AddTimes
              value={data.timesAvailable}
              setValue={(newValue) =>
                setData((data) => ({ ...data, timesAvailable: newValue }))
              }
            />
          </Box>

          <Typography variant="h6">Urlaub/Krankmeldung:</Typography>
          <Leave
            userId={requestedId}
            value={leaveData}
            setValue={setLeaveData}
          />

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
            <Button
              variant="contained"
              onClick={() => submitForm()}
              // TODO: rework form validation to provide more direct feedback to user
              // disabled={!formValidation('teacher', data).validation}
            >
              Speichern
            </Button>
            {id && data.state === TeacherState.APPLIED && (
              <Button
                variant="contained"
                color="success"
                disabled={data.degree === Degree.NOINFO || !data.fee}
                onClick={() => submitForm({ state: TeacherState.EMPLOYED })}
              >
                Bewerbung annehmen
              </Button>
            )}
            {id && (
              <Button
                variant="outlined"
                onClick={() => setDialogOpen(true)}
                sx={{ marginLeft: 'auto' }}
                color="error"
              >
                Entfernen
              </Button>
            )}
          </Stack>
          {requestedId === 'me' && data.state === TeacherState.APPLIED && (
            <Stack direction="row" alignItems="center" gap={1}>
              <CheckIcon color="success" />
              <Typography variant="subtitle1">
                Alle benötigten Daten wurden hinterlegt und werden nun geprüft.
              </Typography>
            </Stack>
          )}

          <h3>Dokumente:</h3>
          <UserDocuments
            userId={requestedId !== 'me' ? parseInt(requestedId) : undefined}
          />

          <h3>Abrechnung generieren:</h3>
          <InvoiceDataSelect
            generateInvoice={generateInvoice}
            invoiceDialog={false}
          />
        </Stack>
      </Box>
      <Dialog
        open={dialogOpen}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{'Lehrkraft wirklich löschen?'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Lehrkräfte können nur gelöscht werden, wenn sie in keinen laufenden
            oder zukünftigen Verträgen mehr eingeplant sind.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={deleteUser}>Löschen</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default TeacherDetailView
