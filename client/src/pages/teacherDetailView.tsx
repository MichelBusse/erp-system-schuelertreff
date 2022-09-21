import { Clear as ClearIcon } from '@mui/icons-material'
import DescriptionIcon from '@mui/icons-material/Description'
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { DatePicker, DateTimePicker } from '@mui/x-date-pickers'
import axios from 'axios'
import dayjs, { Dayjs } from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { nanoid } from 'nanoid'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import AddTimes from '../components/AddTimes'
import { useAuth } from '../components/AuthProvider'
import ConfirmationDialog, {
  ConfirmationDialogProps,
  defaultConfirmationDialogProps,
} from '../components/ConfirmationDialog'
import IconButtonAdornment from '../components/IconButtonAdornment'
import Leave from '../components/Leave'
import TeacherInvoiceDataSelect, {
  TeacherInvoiceData,
} from '../components/TeacherInvoiceDateSelect'
import UserDocuments from '../components/UserDocuments'
import {
  defaultTeacherFormData,
  snackbarOptions,
  snackbarOptionsError,
  teacherSchoolTypeToString,
  teacherStateToString,
} from '../consts'
import styles from '../pages/gridList.module.scss'
import {
  Degree,
  DeleteState,
  TeacherSchoolType,
  TeacherState,
} from '../types/enums'
import { teacherForm, teacherFormErrorTexts } from '../types/form'
import subject from '../types/subject'
import { leave, teacher, timesAvailableParsed } from '../types/user'
import {
  defaultTeacherFormErrorTexts,
  efzFormValidation,
  teacherFormValidation,
  workContractFormValidation,
} from '../utils/formValidation'

dayjs.extend(customParseFormat)

const TeacherDetailView: React.FC = () => {
  const { API, decodeToken, handleLogout } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()

  const [subjects, setSubjects] = useState<subject[]>([])
  const [data, setData] = useState<teacherForm>(defaultTeacherFormData)
  const [leaveData, setLeaveData] = useState<leave[]>([])
  const [errors, setErrors] = useState<teacherFormErrorTexts>(
    defaultTeacherFormErrorTexts,
  )
  const [refreshDocuments, setRefreshDocuments] = useState(0)

  const [
    applicationMeetingRequestDialogOpen,
    setApplicationMeetingRequestDialogOpen,
  ] = useState<boolean>(false)
  const [applicationMeetingRequestForm, setApplicationMeetingRequestForm] =
    useState<{ dates: (Dayjs | null)[]; fixedRequest: boolean }>({
      dates: [null, null, null],
      fixedRequest: false,
    })

  const requestedId = id ?? 'me'
  const activeTeacherState = decodeToken().state

  const [confirmationDialogProps, setConfirmationDialogProps] =
    useState<ConfirmationDialogProps>(defaultConfirmationDialogProps)

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
      deleteState: newData.deleteState,
      dateOfApplication: newData.dateOfApplication
        ? dayjs(newData.dateOfApplication)
        : null,
      dateOfApplicationMeeting: newData.dateOfApplicationMeeting
        ? dayjs(newData.dateOfApplicationMeeting)
        : null,
      applicationLocation: newData.applicationLocation,
    })

    setLeaveData(newData.leave)
  }

  const sendApplicationMeetingRequest = () => {
    setApplicationMeetingRequestDialogOpen(false)

    API.post('users/teacher/applicationMeetingRequest/' + requestedId, {
      ...applicationMeetingRequestForm,
      dates: applicationMeetingRequestForm.dates.map((date) =>
        date?.format('YYYY-MM-DD HH:mm'),
      ),
    })
      .then((res) => {
        enqueueSnackbar('Rückmeldung gesendet', snackbarOptions)

        updateData(res.data)
      })
      .catch(() => {
        enqueueSnackbar('Ein Fehler ist aufgetreten', snackbarOptionsError)
      })
  }

  const submitForm = (override: Partial<teacherForm> = {}) => {
    const errorTexts = teacherFormValidation(data, id !== undefined)

    setErrors(errorTexts)

    if (errorTexts.valid) {
      const formData: Partial<teacherForm> = {
        ...data,
        ...override,
      }

      const submitForm = {
        ...formData,
        dateOfBirth: formData.dateOfBirth?.format('YYYY-MM-DD') ?? null,
        dateOfApplication:
          formData.dateOfApplication?.format('YYYY-MM-DD') ?? null,
        dateOfApplicationMeeting:
          formData.dateOfApplicationMeeting?.format() ?? null,
        dateOfEmploymentStart:
          formData.dateOfEmploymentStart?.format('YYYY-MM-DD') ?? null,
        timesAvailable: formData.timesAvailable?.map((time) => ({
          dow: time.dow,
          start: time.start?.format('HH:mm'),
          end: time.end?.format('HH:mm'),
        })),
      }

      API.post('users/teacher/' + requestedId, submitForm)
        .then((res) => {
          enqueueSnackbar(
            data.firstName + ' ' + data.lastName + ' gespeichert',
            snackbarOptions,
          )

          updateData(res.data)
        })
        .catch((error) => {
          if (axios.isAxiosError(error) && error.response?.status === 400) {
            enqueueSnackbar(
              (error.response.data as { message: string }).message,
              snackbarOptionsError,
            )
          } else {
            console.error(error)
            enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptionsError)
          }
        })
    } else {
      enqueueSnackbar('Überprüfe deine Eingaben', snackbarOptionsError)
    }
  }

  const deleteUser = () => {
    setConfirmationDialogProps({
      open: true,
      setProps: setConfirmationDialogProps,
      title:
        data.deleteState === DeleteState.ACTIVE
          ? 'Lehrkraft wirklich archivieren?'
          : 'Lehrkraft wirklich löschen?',
      text:
        data.deleteState === DeleteState.ACTIVE
          ? 'Lehrkräfte können nur archiviert werden, wenn sie in keinen laufenden oder zukünftigen Einsätzen mehr eingeplant sind.'
          : 'Lehrkräfte können nur gelöscht werden, wenn sie in keinen vergangenen Einsätzen eingeplant waren.',
      actionText:
        data.deleteState === DeleteState.ACTIVE ? 'Archivieren' : 'Löschen',
      action: () => {
        API.delete('users/teacher/' + requestedId)
          .then(() => {
            enqueueSnackbar(
              data.firstName +
                ' ' +
                data.lastName +
                ' wurde ' +
                (data.deleteState === DeleteState.ACTIVE
                  ? 'archiviert'
                  : 'gelöscht'),
              snackbarOptions,
            )
            navigate('/teachers')
          })
          .catch(() => {
            enqueueSnackbar(
              data.firstName +
                ' ' +
                data.lastName +
                ' kann nicht entfernt werden, da noch Verträge existieren.',
              snackbarOptionsError,
            )
          })
      },
    })
  }

  const generateInvoice = (
    year: number,
    month: number,
    teacherInvoiceData: TeacherInvoiceData,
  ) => {
    enqueueSnackbar('Abrechnung wird generiert...', snackbarOptions)
    API.post('lessons/invoice/teacher', teacherInvoiceData, {
      params: {
        of: dayjs().year(year).month(month).format('YYYY-MM-DD'),
        teacherId: id,
      },
      responseType: 'blob',
    })
      .then((res) => {
        const url = URL.createObjectURL(res.data)

        const link = document.createElement('a')
        link.href = url
        link.setAttribute(
          'download',
          'Abrechnung-' + year + '-' + month + '.pdf',
        )
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      })
      .catch(() => {
        enqueueSnackbar('Ein Fehler ist aufgetreten', snackbarOptionsError)
      })
  }

  const generateWorkContract = () => {
    const errorTexts = workContractFormValidation(data)

    setErrors(errorTexts)

    if (errorTexts.valid) {
      enqueueSnackbar('Arbeitsvertrag wird generiert...', snackbarOptions)
      API.get('users/teacher/generateWorkContract', {
        params: {
          teacherId: id,
        },
      })
        .then(() => {
          setRefreshDocuments((r) => r + 1)
          enqueueSnackbar('Arbeitsvertrag generiert', snackbarOptions)
        })
        .catch(() => {
          enqueueSnackbar('Ein Fehler ist aufgetreten', snackbarOptionsError)
        })
    } else {
      enqueueSnackbar('Überprüfe deine Eingaben', snackbarOptionsError)
    }
  }

  const generateEFZ = () => {
    const errorTexts = efzFormValidation(data)

    setErrors(errorTexts)

    if (errorTexts.valid) {
      enqueueSnackbar('Antrag EFZ wird generiert...', snackbarOptions)
      API.get('users/teacher/generateEFZ', {
        params: {
          teacherId: id,
        },
      })
        .then(() => {
          setRefreshDocuments((r) => r + 1)
          enqueueSnackbar('Antrag EFZ generiert', snackbarOptions)
        })
        .catch(() => {
          enqueueSnackbar('Ein Fehler ist aufgetreten', snackbarOptionsError)
        })
    } else {
      enqueueSnackbar('Überprüfe deine Eingaben', snackbarOptionsError)
    }
  }

  const resetPassword = () => {
    API.post('auth/reset/mail', { mail: data.email })
      .then(() => {
        enqueueSnackbar('Der Passwort-Reset wurde an die E-Mail gesendet')
      })
      .catch(() => {
        enqueueSnackbar('Ein Fehler ist aufgetreten', snackbarOptionsError)
      })
  }

  return (
    <div className={styles.wrapper}>
      <Box className={styles.contentBox}>
        <Stack direction="column" alignItems="stretch" spacing={2}>
          <Typography variant="h6">Person:</Typography>
          <Stack direction="row" columnGap={2}>
            <TextField
              helperText={errors.firstName}
              required
              error={errors.firstName !== ''}
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
            />
            <TextField
              helperText={errors.lastName}
              required
              error={errors.lastName !== ''}
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
              <TextField
                {...params}
                required
                variant="outlined"
                helperText={errors.dateOfBirth}
                error={errors.dateOfBirth !== ''}
              />
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
          {id && (
            <>
              <Typography variant="h6">Bewerbungsdaten:</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <DatePicker
                  label="Datum der Bewerbung"
                  mask="__.__.____"
                  maxDate={dayjs()}
                  value={data.dateOfApplication}
                  onChange={(value) => {
                    setData((d) => ({ ...d, dateOfApplication: value }))
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      helperText={errors.dateOfApplication}
                      error={errors.dateOfApplication !== ''}
                      fullWidth
                    />
                  )}
                  InputAdornmentProps={{
                    position: 'start',
                  }}
                  InputProps={{
                    endAdornment: (
                      <IconButtonAdornment
                        icon={ClearIcon}
                        hidden={data.dateOfApplication === null}
                        onClick={() =>
                          setData((d) => ({ ...d, dateOfApplication: null }))
                        }
                      />
                    ),
                  }}
                />
                <TextField
                  fullWidth={true}
                  helperText={errors.applicationLocation}
                  error={errors.applicationLocation !== ''}
                  label="Ort der Bewerbung"
                  onChange={(event) =>
                    setData((data) => ({
                      ...data,
                      applicationLocation: event.target.value,
                    }))
                  }
                  value={data.applicationLocation ?? ''}
                />
                <DateTimePicker
                  label="Datum des BG"
                  mask="__.__.____ __:__"
                  value={data.dateOfApplicationMeeting}
                  onChange={(value) => {
                    setData((d) => ({ ...d, dateOfApplicationMeeting: value }))
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      helperText={errors.dateOfApplicationMeeting}
                      error={errors.dateOfApplicationMeeting !== ''}
                      fullWidth
                    />
                  )}
                  InputAdornmentProps={{
                    position: 'start',
                  }}
                  InputProps={{
                    endAdornment: (
                      <IconButtonAdornment
                        icon={ClearIcon}
                        hidden={data.dateOfApplicationMeeting === null}
                        onClick={() =>
                          setData((d) => ({
                            ...d,
                            dateOfApplicationMeeting: null,
                          }))
                        }
                      />
                    ),
                  }}
                />
              </Stack>
            </>
          )}
          <Typography variant="h6">Kontakt:</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth={true}
              helperText={errors.email}
              error={errors.email !== ''}
              label="Email"
              required
              disabled={requestedId === 'me'}
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  email: event.target.value.toLowerCase(),
                }))
              }
              value={data.email ?? ''}
            />

            <TextField
              fullWidth={true}
              helperText={errors.phone}
              required
              error={errors.phone !== ''}
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
          <Typography variant="h6">Adresse:</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              helperText={errors.street}
              error={errors.street !== ''}
              required
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
              required
              error={errors.city !== ''}
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
              required
              error={errors.postalCode !== ''}
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
              helperText={errors.bankAccountOwner}
              required
              error={errors.bankAccountOwner !== ''}
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
              helperText={errors.bankInstitution}
              required
              error={errors.bankInstitution !== ''}
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
              helperText={errors.iban}
              required
              error={errors.iban !== ''}
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
              helperText={errors.bic}
              required
              error={errors.bic !== ''}
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  bic: event.target.value,
                }))
              }
              value={data.bic ?? ''}
            />
          </Stack>
          <Typography variant="h6">Lehrkraftdaten:</Typography>
          <Stack direction={'column'} rowGap={2}>
            <Autocomplete
              fullWidth
              multiple
              id="schoolTypes"
              options={Object.values(TeacherSchoolType)}
              getOptionLabel={(option: TeacherSchoolType) =>
                teacherSchoolTypeToString[option]
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Schularten"
                  helperText={errors.teacherSchoolTypes}
                  error={errors.teacherSchoolTypes !== ''}
                />
              )}
              value={(data.teacherSchoolTypes as TeacherSchoolType[]) ?? []}
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
              isOptionEqualToValue={(o, v) => o.id === v.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Fächer"
                  helperText={errors.subjects}
                  error={errors.subjects !== ''}
                />
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
              <TextField
                type="number"
                fullWidth
                id="fee"
                label="Stundensatz"
                required
                variant="outlined"
                disabled={requestedId === 'me'}
                helperText={errors.fee}
                error={errors.fee !== ''}
                value={data.fee ?? ''}
                onChange={(event) =>
                  setData((data) => ({
                    ...data,
                    fee: Number(event.target.value),
                  }))
                }
              />
            </Stack>
            <Stack direction={'row'} columnGap={2}>
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
                    required
                    fullWidth
                    variant="outlined"
                    helperText={errors.dateOfEmploymentStart}
                    error={errors.dateOfEmploymentStart !== ''}
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
            </Stack>
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
            refresh={refreshDocuments}
            userId={requestedId !== 'me' ? parseInt(requestedId) : undefined}
            actions={
              id &&
              (data.state === TeacherState.CONTRACT ||
                data.state === TeacherState.EMPLOYED) && (
                <>
                  <Button
                    variant="text"
                    endIcon={<DescriptionIcon />}
                    onClick={() => generateWorkContract()}
                  >
                    Arbeitsvertrag generieren
                  </Button>
                  <Button
                    variant="text"
                    endIcon={<DescriptionIcon />}
                    onClick={() => generateEFZ()}
                  >
                    Antrag EFZ generieren
                  </Button>
                </>
              )
            }
          />
          {id && (
            <Typography>Status: {teacherStateToString[data.state]}</Typography>
          )}
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ marginTop: '15px' }}
          >
            {id && (
              <Button onClick={() => navigate(-1)} variant="outlined">
                Zurück
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
            {id && (
              <Button
                variant="outlined"
                onClick={() => deleteUser()}
                sx={{ marginLeft: 'auto' }}
                color="error"
              >
                {data.deleteState === DeleteState.ACTIVE
                  ? data.state === TeacherState.CREATED ||
                    data.state === TeacherState.INTERVIEW ||
                    data.state === TeacherState.APPLIED
                    ? 'Ablehnen'
                    : 'Archivieren'
                  : 'Löschen'}
              </Button>
            )}
            {id && data.deleteState === DeleteState.DELETED && (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => submitForm({ deleteState: DeleteState.ACTIVE })}
              >
                Entarchivieren
              </Button>
            )}
            {id &&
              data.state === TeacherState.CREATED &&
              data.deleteState === DeleteState.ACTIVE && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => {
                    setApplicationMeetingRequestDialogOpen(true)
                  }}
                >
                  BG-Terminvoschlag senden
                </Button>
              )}
            {id &&
              data.state === TeacherState.INTERVIEW &&
              data.deleteState === DeleteState.ACTIVE && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => {
                    submitForm({ state: TeacherState.APPLIED })
                  }}
                >
                  BG gehalten
                </Button>
              )}
            {id &&
              data.state === TeacherState.APPLIED &&
              data.deleteState === DeleteState.ACTIVE && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => {
                    submitForm({ state: TeacherState.CONTRACT })
                  }}
                >
                  Bewerbung annehmen
                </Button>
              )}
            {id &&
              data.state === TeacherState.CONTRACT &&
              data.deleteState === DeleteState.ACTIVE && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => submitForm({ state: TeacherState.EMPLOYED })}
                >
                  Einstellen
                </Button>
              )}
            {id &&
              (data.state === TeacherState.CONTRACT ||
                data.state === TeacherState.EMPLOYED) &&
              data.deleteState === DeleteState.ACTIVE && (
                <Button variant="outlined" onClick={() => resetPassword()}>
                  Passwort-Reset
                </Button>
              )}
          </Stack>
          {id &&
            data.state === TeacherState.EMPLOYED &&
            data.deleteState === DeleteState.ACTIVE && (
              <>
                <Typography variant="h6">Abrechnung:</Typography>
                <TeacherInvoiceDataSelect generateInvoice={generateInvoice} />
              </>
            )}
        </Stack>
      </Box>

      <ConfirmationDialog confirmationDialogProps={confirmationDialogProps} />

      <Dialog open={applicationMeetingRequestDialogOpen}>
        <DialogContent>
          <DialogTitle>Rückmeldung senden</DialogTitle>
          <Stack direction={'column'} gap={2}>
            <FormControlLabel
              label="Fester Termin"
              control={
                <Checkbox
                  checked={applicationMeetingRequestForm.fixedRequest}
                  onChange={(e) => {
                    setApplicationMeetingRequestForm((data) => ({
                      ...data,
                      fixedRequest: e.target.checked,
                    }))
                  }}
                  inputProps={{ 'aria-label': 'controlled' }}
                />
              }
            />
            {applicationMeetingRequestForm.dates.map((requestDate, index) => (
              <DateTimePicker
                label={`Terminvorschlag ${index + 1}`}
                minDate={dayjs()}
                key={index}
                minutesStep={5}
                mask="__.__.____ __:__"
                value={requestDate}
                disabled={
                  index !== 0 && applicationMeetingRequestForm.fixedRequest
                }
                onChange={(value) => {
                  setApplicationMeetingRequestForm((form) => {
                    const newRequestDates = [...form.dates]
                    newRequestDates[index] = value
                    return { ...form, dates: newRequestDates }
                  })
                }}
                renderInput={(params) => (
                  <TextField {...params} variant="outlined" fullWidth />
                )}
                InputAdornmentProps={{
                  position: 'start',
                }}
                InputProps={{
                  endAdornment: (
                    <IconButtonAdornment
                      icon={ClearIcon}
                      hidden={requestDate === null}
                      onClick={() => {
                        setApplicationMeetingRequestForm((form) => {
                          const newRequestDates = [...form.dates]
                          newRequestDates[index] = null
                          return { ...form, dates: newRequestDates }
                        })
                      }}
                    />
                  ),
                }}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => setApplicationMeetingRequestDialogOpen(false)}
          >
            Abbrechen
          </Button>
          <Button
            variant="contained"
            onClick={() => sendApplicationMeetingRequest()}
            disabled={!applicationMeetingRequestForm.dates[0]}
          >
            Senden
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default TeacherDetailView
