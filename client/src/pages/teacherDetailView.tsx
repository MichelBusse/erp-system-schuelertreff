import { Clear as ClearIcon } from '@mui/icons-material'
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
import { useTheme } from '@mui/material/styles'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { nanoid } from 'nanoid'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import AddTimes from '../components/AddTimes'
import { useAuth } from '../components/AuthProvider'
import IconButtonAdornment from '../components/IconButtonAdornment'
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
import { Degree, TeacherSchoolType, TeacherState } from '../types/enums'
import { teacherForm } from '../types/form'
import subject from '../types/subject'
import { leave, Role, teacher, timesAvailableParsed } from '../types/user'
import { formValidation } from '../utils/formValidation'

dayjs.extend(customParseFormat)

const TeacherDetailView: React.FC = () => {
  const { API, decodeToken, handleLogout } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()

  const [subjects, setSubjects] = useState<subject[]>([])
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [data, setData] = useState<teacherForm>(defaultTeacherFormData)
  const [leaveData, setLeaveData] = useState<leave[]>([])
  const [errors, setErrors] = useState(defaultTeacherFormData)

  const theme = useTheme()

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
      firstName: newData.firstName ?? '',
      lastName: newData.lastName ?? '',
      city: newData.city ?? '',
      postalCode: newData.postalCode ?? '',
      street: newData.street ?? '',
      email: newData.email ?? '',
      phone: newData.phone ?? '',
      subjects: newData.subjects ?? [],
      degree: newData.degree ?? '',
      teacherSchoolTypes: newData.teacherSchoolTypes ?? [],
      state: newData.state,
      fee: newData.fee,
      timesAvailable: newTimesAvailable,
      dateOfBirth: newData.dateOfBirth ? dayjs(newData.dateOfBirth) : null,
      dateOfEmploymentStart: newData.dateOfEmploymentStart
        ? dayjs(newData.dateOfEmploymentStart)
        : null,
      iban: newData.iban ?? '',
      bic: newData.bic ?? '',
      bankAccountOwner: newData.bankAccountOwner ?? '',
      bankInstitution: newData.bankInstitution ?? '',
    })

    setLeaveData(newData.leave)
  }

  const submitForm = (override: Partial<teacherForm> = {}) => {
    setErrors(formValidation('teacher', data))

    if (formValidation('teacher', data).validation) {
      if (id) navigate('/teachers')

      API.post('users/teacher/' + requestedId, {
        ...data,
        ...override,
        dateOfBirth: data.dateOfBirth?.format(),
        dateOfEmploymentStart: data.dateOfEmploymentStart?.format(),
        timesAvailable: data.timesAvailable.map((time) => ({
          dow: time.dow,
          start: time.start?.format('HH:mm'),
          end: time.end?.format('HH:mm'),
        })),
      })
        .then((res) => {
          enqueueSnackbar(
            data.firstName + ' ' + data.lastName + ' gespeichert',
            snackbarOptions,
          )

          updateData(res.data)
        })
        .catch(() => {
          enqueueSnackbar('Ein Fehler ist aufgetreten', snackbarOptionsError)
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
          [theme.breakpoints.down('sm')]: {
            borderRadius: '0px',
          },
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
              value={data.firstName ?? ''}
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
              value={data.lastName ?? ''}
              InputProps={{
                readOnly: requestedId === 'me',
              }}
            />
          </Stack>
          <DatePicker
            label="Geburtsdatum"
            mask="__.__.____"
            maxDate={dayjs()}
            value={data.dateOfBirth}
            onChange={(value) => {
              setData((d) => ({ ...d, dateOfBirth: value }))
            }}
            renderInput={(params) => (
              <TextField {...params} required variant="outlined" />
            )}
            InputAdornmentProps={{
              position: 'start',
            }}
            InputProps={{
              endAdornment: (
                <IconButtonAdornment
                  icon={ClearIcon}
                  hidden={data.dateOfBirth === null}
                  onClick={() => setData((d) => ({ ...d, dateOfBirth: null }))}
                />
              ),
            }}
          />
          <Typography variant="h6">Adresse:</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
              value={data.street ?? ''}
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
              value={data.city ?? ''}
              InputProps={{
                readOnly: false,
              }}
            />
            <TextField
              label="Postleitzahl"
              helperText={errors.postalCode}
              fullWidth={true}
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  postalCode: event.target.value,
                }))
              }
              value={data.postalCode ?? ''}
              InputProps={{
                readOnly: false,
              }}
            />
          </Stack>
          <Typography variant="h6">Zahlungsdaten:</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth={true}
              label="Kontoinhaber"
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  bankAccountOwner: event.target.value,
                }))
              }
              value={data.bankAccountOwner ?? ''}
            />

            <TextField
              fullWidth={true}
              label="Kreditinstitut"
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  bankInstitution: event.target.value,
                }))
              }
              value={data.bankInstitution ?? ''}
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth={true}
              label="IBAN"
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  iban: event.target.value,
                }))
              }
              value={data.iban ?? ''}
            />

            <TextField
              fullWidth={true}
              label="BIC"
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  bic: event.target.value,
                }))
              }
              value={data.bic ?? ''}
            />
          </Stack>
          <Typography variant="h6">Kontakt:</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth={true}
              helperText={errors.email}
              label="Email"
              disabled={requestedId === 'me'}
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  email: event.target.value,
                }))
              }
              value={data.email ?? ''}
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
              value={data.phone ?? ''}
            />
          </Stack>
          <Typography variant="h6">Lehrkraftdaten:</Typography>
          <Stack direction={'column'} rowGap={2}>
            <Autocomplete
              fullWidth
              multiple
              id="schoolTypes"
              options={[
                TeacherSchoolType.GRUNDSCHULE,
                TeacherSchoolType.OBERSCHULE,
                TeacherSchoolType.GYMSEK1,
                TeacherSchoolType.GYMSEK2,
              ]}
              getOptionLabel={(option) => {
                switch (option) {
                  case TeacherSchoolType.GRUNDSCHULE:
                    return 'Grundschule'
                  case TeacherSchoolType.OBERSCHULE:
                    return 'Oberschule'
                  case TeacherSchoolType.GYMSEK1:
                    return 'Gymnasium Sek. 1'
                  case TeacherSchoolType.GYMSEK2:
                    return 'Gymnasium Sek. 2'
                  default:
                    return ''
                }
              }}
              renderInput={(params) => (
                <TextField {...params} variant="outlined" label="Schularten" />
              )}
              value={data.teacherSchoolTypes ?? []}
              onChange={(_, value) =>
                setData((data) => ({ ...data, teacherSchoolTypes: value }))
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
              value={data.subjects ?? []}
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
                  value={data.degree ?? ''}
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
              <DatePicker
                label="Beginn Arbeitsvertrag"
                mask="__.__.____"
                value={data.dateOfEmploymentStart}
                disabled={requestedId === 'me'}
                onChange={(value) => {
                  setData((d) => ({ ...d, dateOfEmploymentStart: value }))
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    required
                    variant="outlined"
                  />
                )}
                InputAdornmentProps={{
                  position: 'start',
                }}
                InputProps={{
                  endAdornment: (
                    <IconButtonAdornment
                      icon={ClearIcon}
                      hidden={data.dateOfEmploymentStart === null}
                      onClick={() =>
                        setData((d) => ({ ...d, dateOfEmploymentStart: null }))
                      }
                    />
                  ),
                }}
              />
              <TextField
                type="number"
                fullWidth
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
              value={data.timesAvailable ?? []}
              setValue={(newValue) =>
                setData((data) => ({ ...data, timesAvailable: newValue }))
              }
            />
          </Box>
          {data.state === TeacherState.EMPLOYED && (
            <>
              <Typography variant="h6">Urlaub/Krankmeldung:</Typography>
              <Leave
                userId={requestedId}
                value={leaveData}
                setValue={setLeaveData}
              />
            </>
          )}

          <h3>Dokumente:</h3>
          <UserDocuments
            userId={requestedId !== 'me' ? parseInt(requestedId) : undefined}
          />
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ marginTop: '15px' }}
          >
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
            {requestedId === 'me' && data.state !== TeacherState.EMPLOYED && (
              <Button
                onClick={() => handleLogout()}
                variant="text"
                color="error"
              >
                Logout
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
                disabled={!data.fee || !data.dateOfEmploymentStart}
                onClick={() => {
                  enqueueSnackbar(
                    'Arbeitsvertrag wird generiert',
                    snackbarOptions,
                  )
                  submitForm({ state: TeacherState.CONTRACT })
                }}
              >
                Arbeitsvertrag senden
              </Button>
            )}
            {id && data.state === TeacherState.CONTRACT && (
              <Button
                variant="contained"
                color="success"
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

          {requestedId !== 'me' && data.state === TeacherState.EMPLOYED && (
            <>
              <Typography variant="h6">Abrechnung:</Typography>
              <InvoiceDataSelect
                generateInvoice={generateInvoice}
                type={Role.TEACHER}
              />
            </>
          )}
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
