import 'dayjs/locale/de'

import { InfoOutlined } from '@mui/icons-material'
import ClearIcon from '@mui/icons-material/Clear'
import { LoadingButton } from '@mui/lab'
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  ListSubheader,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Switch,
  TextField,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs, { Dayjs } from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { useSnackbar } from 'notistack'
import React, { useEffect, useState } from 'react'

import { leaveTypeToString, snackbarOptionsError } from '../consts'
import { ContractState, contractWithTeacher } from '../types/contract'
import subject from '../types/subject'
import {
  classCustomer,
  leave,
  privateCustomer,
  school,
  teacher,
} from '../types/user'
import { getNextDow } from '../utils/date'
import { useAuth } from './AuthProvider'
import BetterTimePicker from './BetterTimePicker'
import EqualStack from './EqualStack'
import IconButtonAdornment from './IconButtonAdornment'

dayjs.extend(customParseFormat)

enum CustomerType {
  PRIVATE = 'privateCustomer',
  SCHOOL = 'school',
}

type suggestion = {
  teacherId: number
  teacherName: string
  suggestions: {
    dow: number
    start: string
    end: string
    overlap: number[]
  }[]
  leave: leave[]
}

type form0 = {
  school: {
    id: number
    schoolName: string
  } | null
  classCustomers: classCustomer[]
  privateCustomers: privateCustomer[]
  subject: subject | null
  interval: number
  startDate: Dayjs | null
  endDate: Dayjs | null
}

type form1 = {
  startDate: Dayjs | null
  endDate: Dayjs | null
  startTime: Dayjs | null
  endTime: Dayjs | null
  minTime: Dayjs | null
  maxTime: Dayjs | null
  teacher: string
  teacherConfirmation: boolean
  dow: number
}

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  onSuccess?: () => void
  initialContract?: contractWithTeacher | null
}

const ContractDialog: React.FC<Props> = ({
  open,
  setOpen,
  onSuccess = () => {},
  initialContract,
}) => {
  const { API } = useAuth()
  const { enqueueSnackbar } = useSnackbar()

  const [activeStep, setActiveStep] = useState(0)

  // step 0
  const [customerType, setCustomerType] = useState(CustomerType.PRIVATE)
  const [privateCustomers, setPrivateCustomers] = useState<privateCustomer[]>(
    [],
  )
  const [teachers, setTeachers] = useState<teacher[]>([])
  const [schools, setSchools] = useState<school[]>([])
  const [classCustomers, setClassCustomers] = useState<classCustomer[]>([])
  const [subjects, setSubjects] = useState<subject[]>([])
  const [loading0, setLoading0] = useState(false)
  const [form0, setForm0] = useState<form0>({
    school: null,
    classCustomers: [],
    privateCustomers: [],
    subject: null,
    interval: 1,
    startDate: dayjs().add(1, 'day'),
    endDate: dayjs().add(1, 'day').add(1, 'year'),
  })

  // step 1
  const [suggestions, setSuggestions] = useState<suggestion[]>([])
  const [selSuggestion, setSelSuggestion] = useState<string>('')
  const [leaves, setLeaves] = useState<Record<number, leave[]>>([])
  const [loading1, setLoading1] = useState(false)
  const [form1, setForm1] = useState<form1>({
    startDate: null,
    endDate: null,
    startTime: null,
    endTime: null,
    minTime: null,
    maxTime: null,
    teacher: '',
    teacherConfirmation: true,
    dow: 1,
  })

  useEffect(() => {
    if (!initialContract) return

    if (initialContract.customers[0].role === CustomerType.PRIVATE) {
      setCustomerType(CustomerType.PRIVATE)
      console.log(initialContract.customers[0])
    } else {
      setCustomerType(CustomerType.SCHOOL)

      console.log(initialContract.customers[0])
    }

    setForm0((form0) => {
      const initialForm0Entry: form0 = {
        ...form0,
        startDate: dayjs(initialContract.startDate, 'YYYY-MM-DD'),
        endDate: dayjs(initialContract.endDate, 'YYYY-MM-DD'),
        subject: initialContract.subject,
        interval: initialContract.interval,
      }
      if (initialContract.customers[0].role === CustomerType.PRIVATE) {
        initialForm0Entry.privateCustomers =
          initialContract.customers as privateCustomer[]
      } else {
        initialForm0Entry.school = (
          initialContract.customers[0] as classCustomer
        ).school
        initialForm0Entry.classCustomers =
          initialContract.customers as classCustomer[]
      }

      return initialForm0Entry
    })
  }, [initialContract])

  useEffect(() => {
    API.get('users/privateCustomer')
      .then((res) => setPrivateCustomers(res.data))
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptionsError)
      })

    API.get('users/teacher')
      .then((res) => setTeachers(res.data))
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptionsError)
      })

    API.get('users/school')
      .then((res) => setSchools(res.data))
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptionsError)
      })

    API.get('subjects')
      .then((res) => setSubjects(res.data))
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptionsError)
      })
  }, [])

  const validForm0 = !!(
    form0.subject &&
    form0.interval &&
    form0.startDate &&
    form0.endDate &&
    ((customerType === CustomerType.PRIVATE &&
      form0.privateCustomers.length > 0) ||
      (customerType === CustomerType.SCHOOL &&
        form0.school !== null &&
        form0.classCustomers.length > 0))
  )

  const loadClasses = (id: number) => {
    API.get('users/classCustomer/' + id)
      .then((res) => setClassCustomers(res.data))
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptionsError)
      })
  }

  const handleSubmit0 = () => {
    setLoading0(true)

    API.get('users/leaves/intersecting', {
      params: {
        start: form0.startDate?.format('YYYY-MM-DD'),
        end: form0.endDate?.format('YYYY-MM-DD'),
      },
    })
      .then((res) => {
        const leavesByTeacher: Record<number, leave[]> = {}

        ;(res.data as leave[]).map((l) => {
          leavesByTeacher[l.user.id] = [
            ...(leavesByTeacher[l.user.id] ?? []),
            l,
          ]
        })

        setLeaves(leavesByTeacher)
      })
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptionsError)
      })

    API.get('contracts/suggest', {
      params: {
        customers: (customerType === 'school'
          ? form0.classCustomers
          : form0.privateCustomers
        )
          .map((c) => c.id)
          .join(','),
        subjectId: form0.subject?.id,
        interval: form0.interval,
        startDate: form0.startDate?.format('YYYY-MM-DD'),
        endDate: form0.endDate?.format('YYYY-MM-DD'),
      },
    })
      .then((res) => {
        setSuggestions(res.data)
        setActiveStep(1)

        updateSelSuggestion('')
        setForm1({
          startDate: form0.startDate,
          endDate: form0.endDate,
          startTime: null,
          endTime: null,
          minTime: null,
          maxTime: null,
          teacher: '',
          teacherConfirmation: true,
          dow: form0.startDate?.day() ?? 1,
        })

        if (initialContract) {
          const initialStartDate = dayjs(
            initialContract.startDate,
            'YYYY-MM-DD',
          )
          const initialStartTime = dayjs(initialContract.startTime, 'hh:mm')
          const initialEndTime = dayjs(initialContract.endTime, 'hh:mm')

          const resSuggestions = res.data as suggestion[]

          resSuggestions.forEach((teacherSuggestion, teacherIndex) => {
            if (teacherSuggestion.teacherId === initialContract.teacher.id) {
              teacherSuggestion.suggestions.forEach(
                (timeSuggestion, timeIndex) => {
                  if (
                    timeSuggestion.dow === initialStartDate.day() &&
                    !dayjs(timeSuggestion.start, 'hh:mm').isAfter(
                      initialStartTime,
                    ) &&
                    !dayjs(timeSuggestion.end, 'hh:mm').isBefore(initialEndTime)
                  ) {
                    setSelSuggestion(teacherIndex + ',' + timeIndex)
                    setForm1((form1) => {
                      const initialForm1Entry: form1 = {
                        ...form1,
                        startDate: initialStartDate,
                        endDate: dayjs(initialContract.endDate, 'YYYY-MM-DD'),
                        startTime: initialStartTime,
                        endTime: initialEndTime,
                        teacher: initialContract.teacher.id.toString(),
                        dow: initialStartDate.day(),
                      }

                      return initialForm1Entry
                    })
                  }
                },
              )
            }
          })
        }
      })
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptionsError)
      })
      .finally(() => setLoading0(false))
  }

  const updateSelSuggestion = (newSuggestion: string) => {
    setSelSuggestion(newSuggestion)

    if (newSuggestion !== '') {
      const [t, s] = newSuggestion.split(',').map((n) => parseInt(n))

      const teacher = suggestions[t]
      const suggestion = teacher.suggestions[s]

      const startTime = dayjs(suggestion.start, 'HH:mm')
      const endTime =
        suggestion.end !== '24:00'
          ? dayjs(suggestion.end, 'HH:mm')
          : dayjs(suggestion.end, 'HH:mm').subtract(5, 'minute')

      setForm1({
        startDate: form0.startDate
          ? getNextDow(suggestion.dow, form0.startDate)
          : null,
        endDate: form0.endDate,
        startTime: startTime,
        endTime: endTime,
        minTime: startTime,
        maxTime: endTime,
        teacher: teacher.teacherId.toString(),
        teacherConfirmation: true,
        dow: suggestion.dow,
      })
    } else {
      setForm1({
        startDate: form0.startDate,
        endDate: form0.endDate,
        startTime: null,
        endTime: null,
        minTime: null,
        maxTime: null,
        teacher: '',
        teacherConfirmation: true,
        dow: form0.startDate?.day() ?? 1,
      })
    }
  }

  const validForm1 = !!(
    form1.teacher !== '' &&
    form1.startDate !== null &&
    form1.startTime !== null &&
    form1.endTime !== null
  )

  const handleSubmit1 = () => {
    setLoading1(true)

    API.post('contracts', {
      customers: (customerType === 'school'
        ? form0.classCustomers
        : form0.privateCustomers
      ).map((c) => c.id),
      subject: form0.subject?.id,
      interval: form0.interval,
      teacher: form1.teacher,
      startDate: form1.startDate?.format('YYYY-MM-DD'),
      endDate: form1.endDate?.format('YYYY-MM-DD'),
      startTime: form1.startTime?.format('HH:mm'),
      endTime: form1.endTime?.format('HH:mm'),
      state: form1.teacherConfirmation
        ? ContractState.PENDING
        : ContractState.ACCEPTED,
    })
      .then(() => {
        onSuccess()

        if (initialContract) {
          API.delete('contracts/' + initialContract.id)
        }

        setOpen(false)
      })
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptionsError)
      })
      .finally(() => setLoading1(false))
  }

  const PrivateCustomerSelect = () => {
    return (
      <Autocomplete
        fullWidth
        multiple
        size="small"
        options={privateCustomers}
        getOptionLabel={(o) => o.firstName + ' ' + o.lastName}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        value={form0.privateCustomers}
        onChange={(_, value) =>
          setForm0((data) => ({ ...data, privateCustomers: value }))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            required
            size="medium"
            variant="standard"
            label="Kunde(n)"
          />
        )}
      />
    )
  }

  const SchoolSelect = () => {
    return (
      <>
        <Autocomplete
          fullWidth
          size="small"
          options={schools}
          getOptionLabel={(o) => o.schoolName}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          value={form0.school}
          onChange={(_, value) => {
            setForm0((data) => ({ ...data, school: value }))

            if (value !== null) loadClasses(value.id)
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              required
              size="medium"
              variant="standard"
              label="Schule"
            />
          )}
        />
        <Autocomplete
          disabled={form0.school === null}
          fullWidth
          multiple
          size="small"
          options={classCustomers}
          getOptionLabel={(o) => o.className}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          value={form0.classCustomers}
          onChange={(_, value) =>
            setForm0((data) => ({ ...data, classCustomers: value }))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              required
              size="medium"
              variant="standard"
              label="Klasse(n)"
            />
          )}
        />
      </>
    )
  }

  const steps: {
    label: string
    content: React.ReactNode
    actions: React.ReactNode
  }[] = [
    {
      label: 'Filterkonditionen',
      content: (
        <Stack spacing={2} marginTop={1}>
          <FormControl>
            <RadioGroup
              row
              value={customerType}
              onChange={(event) =>
                setCustomerType(event.target.value as CustomerType)
              }
            >
              <FormControlLabel
                value={CustomerType.PRIVATE}
                label="Privatkunde"
                control={<Radio />}
              />
              <FormControlLabel
                value={CustomerType.SCHOOL}
                label="Schule"
                control={<Radio />}
              />
            </RadioGroup>
          </FormControl>

          {customerType === 'privateCustomer' ? (
            <PrivateCustomerSelect />
          ) : (
            <SchoolSelect />
          )}

          <EqualStack direction="row" spacing={2}>
            <Autocomplete
              options={subjects}
              getOptionLabel={(o) => o.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={form0.subject}
              onChange={(_, value) =>
                setForm0((data) => ({ ...data, subject: value }))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  variant="outlined"
                  label="Fach"
                />
              )}
            />
            <TextField
              required
              label="Wochenintervall"
              variant="outlined"
              type="number"
              value={form0.interval}
              onChange={(e) => {
                let value = parseInt(e.target.value, 10) || 1
                value = Math.max(1, Math.min(value, 4))

                setForm0((data) => ({
                  ...data,
                  interval: value,
                }))
              }}
              InputProps={{
                inputProps: {
                  max: 4,
                  min: 1,
                },
              }}
            />
          </EqualStack>
          <EqualStack direction="row" spacing={2}>
            <DatePicker
              label="Startdatum"
              mask="__.__.____"
              minDate={dayjs().add(1, 'd')}
              value={form0.startDate}
              onChange={(value) => {
                setForm0((data) => ({
                  ...data,
                  startDate: value,
                  endDate: value ? value.add(1, 'year') : null,
                }))
              }}
              shouldDisableDate={(date) => [0, 6].includes(date.day())}
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
                    hidden={form0.startDate === null}
                    onClick={() =>
                      setForm0((data) => ({
                        ...data,
                        startDate: null,
                      }))
                    }
                  />
                ),
              }}
            />
            <DatePicker
              label="Enddatum"
              mask="__.__.____"
              minDate={form0.startDate?.add(7, 'day') ?? undefined}
              defaultCalendarMonth={form0.startDate ?? undefined}
              disabled={form0.startDate === null}
              value={form0.endDate}
              onChange={(value) => {
                setForm0((data) => ({ ...data, endDate: value }))
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
                    hidden={form0.endDate === null}
                    onClick={() =>
                      setForm0((data) => ({ ...data, endDate: null }))
                    }
                  />
                ),
              }}
            />
          </EqualStack>
        </Stack>
      ),
      actions: (
        <>
          <Button onClick={() => setOpen(false)}>Abbrechen</Button>
          <LoadingButton
            variant="contained"
            onClick={handleSubmit0}
            loading={loading0}
            disabled={!validForm0}
          >
            Weiter
          </LoadingButton>
        </>
      ),
    },

    {
      label: 'Termin auswählen',
      content: (
        <Stack spacing={2} marginTop={1}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel htmlFor="suggestion-select">
              {suggestions.length > 0 ? 'Vorschläge' : 'Keine Vorschläge'}
            </InputLabel>
            <Select
              id="suggestion-select"
              label={suggestions.length > 0 ? 'Vorschläge' : 'Keine Vorschläge'}
              disabled={suggestions.length === 0}
              value={selSuggestion}
              onChange={(e) => updateSelSuggestion(e.target.value)}
            >
              <MenuItem value="">freie Wahl</MenuItem>
              {suggestions.flatMap((t, i) => [
                <ListSubheader key={t.teacherId}>
                  {t.teacherName}
                </ListSubheader>,
                t.suggestions.map((s, j) => {
                  let text =
                    `${dayjs().day(s.dow).format('dd')} ` +
                    `${s.start} - ${s.end}`

                  if (s.overlap.length > 0) text += ' *'

                  return (
                    <MenuItem key={i + ',' + j} value={i + ',' + j}>
                      {text}
                    </MenuItem>
                  )
                }),
              ])}
            </Select>
          </FormControl>

          <FormControl variant="outlined" fullWidth required>
            <InputLabel htmlFor="teacher-select">Lehrkraft</InputLabel>
            <Select
              id="teacher-select"
              label={'Lehrkraft'}
              disabled={selSuggestion !== ''}
              value={form1.teacher}
              onChange={(e) =>
                setForm1((data) => ({ ...data, teacher: e.target.value }))
              }
              endAdornment={
                <IconButtonAdornment
                  margin="16px"
                  color="warning"
                  icon={InfoOutlined}
                  hidden={!leaves[parseInt(form1.teacher)]}
                  tooltip={
                    !leaves[parseInt(form1.teacher)] ? (
                      ''
                    ) : (
                      <>
                        {leaves[parseInt(form1.teacher)]?.map((l) => (
                          <p key={l.id}>
                            {leaveTypeToString[l.type] +
                              ': ' +
                              l.startDate +
                              ' - ' +
                              l.endDate}
                          </p>
                        ))}
                      </>
                    )
                  }
                />
              }
            >
              {teachers
                .filter(
                  (t) =>
                    form0.subject !== null &&
                    t.subjects.some((s) => s.id === form0.subject?.id),
                )
                .map((t) => (
                  <MenuItem key={t.id} value={t.id.toString()}>
                    {`${t.firstName} ${t.lastName}`}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <EqualStack direction="row" spacing={2}>
            <FormControl variant="outlined" fullWidth required>
              <InputLabel htmlFor="weekday-select">Wochentag</InputLabel>
              <Select
                id="weekday-select"
                label={'Wochentag'}
                value={form1.dow}
                disabled={selSuggestion !== ''}
                onChange={(e) => {
                  setForm1((data) => ({
                    ...data,
                    dow: e.target.value as number,
                    startDate:
                      form0.startDate &&
                      getNextDow(e.target.value as number, form0.startDate),
                  }))
                }}
              >
                <MenuItem value={1}>{`Montag (Start: ${
                  form0.startDate
                    ? getNextDow(1, form0.startDate).format('DD.MM.YYYY')
                    : ''
                })`}</MenuItem>
                <MenuItem value={2}>{`Dienstag (Start: ${
                  form0.startDate
                    ? getNextDow(2, form0.startDate).format('DD.MM.YYYY')
                    : ''
                })`}</MenuItem>
                <MenuItem value={3}>{`Mittwoch (Start: ${
                  form0.startDate
                    ? getNextDow(3, form0.startDate).format('DD.MM.YYYY')
                    : ''
                })`}</MenuItem>
                <MenuItem value={4}>{`Donnerstag (Start: ${
                  form0.startDate
                    ? getNextDow(4, form0.startDate).format('DD.MM.YYYY')
                    : ''
                })`}</MenuItem>
                <MenuItem value={5}>{`Freitag (Start: ${
                  form0.startDate
                    ? getNextDow(5, form0.startDate).format('DD.MM.YYYY')
                    : ''
                })`}</MenuItem>
              </Select>
            </FormControl>
          </EqualStack>
          <EqualStack direction="row" spacing={2}>
            <BetterTimePicker
              label="Startzeit"
              required
              minutesStep={5}
              minTime={form1.minTime ?? undefined}
              maxTime={form1.endTime?.subtract(45, 'm')}
              value={form1.startTime}
              onChange={(value) => {
                setForm1((data) => ({ ...data, startTime: value }))
              }}
              clearValue={() => {
                setForm1((data) => ({ ...data, startTime: null }))
              }}
            />
            <BetterTimePicker
              label="Endzeit"
              required
              minutesStep={5}
              minTime={form1.startTime?.add(45, 'm')}
              maxTime={form1.maxTime ?? undefined}
              value={form1.endTime}
              onChange={(value) => {
                setForm1((data) => ({ ...data, endTime: value }))
              }}
              clearValue={() => {
                setForm1((data) => ({ ...data, endTime: null }))
              }}
            />
          </EqualStack>

          <FormControlLabel
            label="Bestätigung der Lehrkraft anfordern"
            control={
              <Switch
                checked={form1.teacherConfirmation}
                onChange={(event) => {
                  setForm1((data) => ({
                    ...data,
                    teacherConfirmation: event.target.checked,
                  }))
                }}
              />
            }
          />
        </Stack>
      ),
      actions: (
        <>
          <Button onClick={() => setOpen(false)}>Abbrechen</Button>
          <Button onClick={() => setActiveStep(0)}>Zurück</Button>
          <LoadingButton
            variant="contained"
            onClick={handleSubmit1}
            loading={loading1}
            disabled={!validForm1}
          >
            Hinzufügen
          </LoadingButton>
        </>
      ),
    },
  ]

  return (
    <Dialog open={open}>
      <DialogTitle>Contract hinzufügen</DialogTitle>
      <DialogContent
        sx={{
          width: 500,
          '& .MuiStepConnector-root': {
            maxWidth: '100px',
          },
        }}
      >
        <Stepper activeStep={activeStep}>
          {steps.map((step) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box sx={{ overflow: 'auto', padding: 0.5, height: '345px' }}>
          {steps[activeStep].content}
        </Box>
      </DialogContent>
      <DialogActions>{steps[activeStep].actions}</DialogActions>
    </Dialog>
  )
}

export default ContractDialog
