import 'dayjs/locale/de'

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
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs, { Dayjs } from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { useSnackbar } from 'notistack'
import React, { useEffect, useState } from 'react'

import { snackbarOptionsError } from '../consts'
import { ContractState } from '../types/contract'
import subject from '../types/subject'
import { classCustomer, customer, privateCustomer, school, teacher } from '../types/user'
import { getNextDow } from '../utils/date'
import { useAuth } from './AuthProvider'
import BetterTimePicker from './BetterTimePicker'
import EqualStack from './EqualStack'
import IconButtonAdornment from './IconButtonAdornment'

dayjs.extend(customParseFormat)

type suggestion = {
  teacherId: number
  teacherName: string
  suggestions: {
    dow: number
    start: string
    end: string
    overlap: number[]
  }[]
}

type form0 = {
  school: {
    id: number
    schoolName: string
  } | null
  customers: customer[]
  subject: subject | null
  interval: number
  startDate: Dayjs | null
  endDate: Dayjs | null
  startTime: Dayjs | null
  endTime: Dayjs | null
}

type form1 = {
  startDate: Dayjs | null
  endDate: Dayjs | null
  startTime: Dayjs | null
  endTime: Dayjs | null
  minTime: Dayjs | null
  maxTime: Dayjs | null
  teacher: string
  dow: number | null
  state: ContractState
}

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  onSuccess?: () => void
  teachers: teacher[]
}

const ContractDialog: React.FC<Props> = ({
  open,
  setOpen,
  onSuccess = () => {},
  teachers,
}) => {
  const { API } = useAuth()
  const { enqueueSnackbar } = useSnackbar()

  const [activeStep, setActiveStep] = useState(0)

  // step 9
  const [loading9, setLoading9] = useState(false)
  const [form9, setForm9] = useState<string>('')

  // step 0
  const [schools, setSchools] = useState<school[]>([])
  const [customers, setCustomers] = useState<customer[]>([])
  const [subjects, setSubjects] = useState<subject[]>([])
  const [loading0, setLoading0] = useState(false)
  const [form0, setForm0] = useState<form0>({
    school: {
      id: 0,
      schoolName: '',
    },
    customers: [],
    subject: null,
    interval: 1,
    startDate: dayjs().add(1, 'day'),
    endDate: dayjs().add(1, 'day').add(1, 'year'),
    startTime: null,
    endTime: null,
  })

  // step 1
  const [suggestions, setSuggestions] = useState<suggestion[]>([])
  const [loading1, setLoading1] = useState(false)
  const [selSuggestion, setSelSuggestion] = useState<string>('')
  const [form1, setForm1] = useState<form1>({
    startDate: null,
    endDate: null,
    startTime: null,
    endTime: null,
    minTime: null,
    maxTime: null,
    teacher: '',
    dow: null,
    state: ContractState.PENDING,
  })

  const validForm9 = !!form9

  const handleChange9 = (event: SelectChangeEvent) => {
    setForm9(event.target.value as string)
  }

  const handleSubmit9 = () => {
    setLoading9(true)

    if (form9 === 'privateCustomer') {
      // get customers, subjects from DB
      API.get('users/privateCustomer')
        .then((res) => setCustomers(res.data))
        .catch((err) => {
          console.error(err)
          enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptionsError)
        })

      API.get('subjects')
        .then((res) => {
          setSubjects(res.data)
          setActiveStep(1)
        })
        .catch((err) => {
          console.error(err)
          enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptionsError)
        })
        .finally(() => setLoading9(false))
    }

    if (form9 === 'school') {
      console.log('drin2')
      // get customers, subjects from DB
      API.get('users/school')
        .then((res) => setSchools(res.data))
        .catch((err) => {
          console.error(err)
          enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptionsError)
        })

      API.get('subjects')
        .then((res) => {
          setSubjects(res.data)
          setActiveStep(1)
        })
        .catch((err) => {
          console.error(err)
          enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptionsError)
        })
        .finally(() => setLoading9(false))
    }
  }

  const validForm0 = !!(
    form0.customers.length &&
    form0.subject &&
    form0.interval &&
    form0.startDate &&
    form0.endDate
  )

  const activateClassSelect = !!(form0.school?.id != 0)

  const loadClasses = (id: number) => {
    API.get('users/classCustomer/' + id)
      .then((res) => setCustomers(res.data))
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptionsError)
      })
  }

  const handleSubmit0 = () => {
    setLoading0(true)

    API.get('contracts/suggest', {
      params: {
        customers: form0.customers.map((c) => c.id).join(','),
        subjectId: form0.subject?.id,
        interval: form0.interval,
        startDate: form0.startDate?.format('YYYY-MM-DD'),
        endDate: form0.endDate?.format('YYYY-MM-DD'),
        startTime: form0.startTime?.format('HH:mm'),
        endTime: form0.endTime?.format('HH:mm'),
      },
    })
      .then((res) => {
        updateSelSuggestion('')
        setSuggestions(res.data)
        setActiveStep(2)
        setForm1({
          startDate: form0.startDate,
          endDate: form0.endDate,
          startTime: form0.startTime,
          endTime: form0.endTime,
          minTime: form0.startTime,
          maxTime: form0.endTime,
          teacher: '',
          dow: null,
          state: ContractState.PENDING,
        })
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
        dow: suggestion.dow,
        state: ContractState.PENDING,
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
        dow: null,
        state: ContractState.PENDING,
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
      customers: form0.customers.map((c) => c.id),
      subject: form0.subject?.id,
      interval: form0.interval,
      teacher: form1.teacher,
      startDate: form1.startDate?.format('YYYY-MM-DD'),
      endDate: form1.endDate?.format('YYYY-MM-DD'),
      startTime: form1.startTime?.format('HH:mm'),
      endTime: form1.endTime?.format('HH:mm'),
      state: form1.state,
    })
      .then(() => {
        onSuccess()
        setOpen(false)
      })
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptionsError)
      })
      .finally(() => setLoading1(false))
  }

  const privateCustomerSelect = () => {
    return (
      <Autocomplete
        fullWidth
        multiple
        size="small"
        options={customers as privateCustomer[]}
        getOptionLabel={(o) => o.firstName + ' ' + o.lastName}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        value={form0.customers as privateCustomer[]}
        onChange={(_, value) =>
          setForm0((data) => ({ ...data, customers: value }))
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

  const schoolSelect = () => {
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
            value && loadClasses(value.id)
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
          disabled={!activateClassSelect}
          fullWidth
          multiple
          size="small"
          options={customers as classCustomer[]}
          getOptionLabel={(o) => o.className}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          value={form0.customers as classCustomer[]}
          onChange={(_, value) =>
            setForm0((data) => ({ ...data, customers: value }))
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

  const chooseSelect = () => {
    if (form9 === 'privateCustomer') {
      return privateCustomerSelect()
    }
    if (form9 === 'school') {
      return schoolSelect()
    }
  }

  const steps: {
    label: string
    content: React.ReactNode
    actions: React.ReactNode
  }[] = [
    {
      label: 'Vertragspartner',
      content: (
        <Stack spacing={2} marginTop={1}>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">
              Vertragspartner
            </InputLabel>
            <Select
              labelId="contractPartner"
              id="contractPartner"
              value={form9}
              label="Vertragspartner"
              onChange={handleChange9}
            >
              <MenuItem value={'privateCustomer'}>Privatkunde</MenuItem>
              <MenuItem value={'school'}>Schule</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      ),
      actions: (
        <>
          <Button onClick={() => setOpen(false)}>Abbrechen</Button>
          <LoadingButton
            variant="contained"
            onClick={handleSubmit9}
            loading={loading9}
            disabled={!validForm9}
          >
            Weiter
          </LoadingButton>
        </>
      ),
    },

    {
      label: 'Filterkonditionen',
      content: (
        <Stack spacing={2} marginTop={1}>
          {chooseSelect()}
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
                  endDate: null,
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
          <Button onClick={() => setActiveStep(0)}>Zurück</Button>
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
                value={(form1.startDate && form1.startDate.day()) || null}
                disabled={selSuggestion !== ''}
                onChange={(e) => {
                  setForm1((data) => ({
                    ...data,
                    startDate: form0.startDate
                      ? getNextDow(e.target.value as number, form0.startDate)
                      : null,
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
                <MenuItem value={4}>{`Donnerstag (Start:${
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
              minTime={form1.minTime ?? form0.startTime ?? undefined}
              maxTime={(form1.endTime ?? form0.endTime)?.subtract(45, 'm')}
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
              minTime={(form1.startTime ?? form0.startTime)?.add(45, 'm')}
              maxTime={form1.maxTime ?? form0.endTime ?? undefined}
              value={form1.endTime}
              onChange={(value) => {
                setForm1((data) => ({ ...data, endTime: value }))
              }}
              clearValue={() => {
                setForm1((data) => ({ ...data, endTime: null }))
              }}
            />
          </EqualStack>
          <FormControl variant="outlined" fullWidth required>
            <InputLabel htmlFor="contract-state-select">Annehmen</InputLabel>
            <Select
              id="contract-state-select"
              label={'Annehmen'}
              value={form1.state}
              onChange={(e) =>
                setForm1((data) => ({
                  ...data,
                  state: e.target.value as ContractState,
                }))
              }
            >
              <MenuItem key={1} value={ContractState.PENDING}>
                Von Lehrkraft abfragen
              </MenuItem>
              <MenuItem key={2} value={ContractState.ACCEPTED}>
                Automatisch annehmen
              </MenuItem>
            </Select>
          </FormControl>
        </Stack>
      ),
      actions: (
        <>
          <Button onClick={() => setOpen(false)}>Abbrechen</Button>
          <Button onClick={() => setActiveStep(1)}>Zurück</Button>
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
        <Box sx={{ overflow: 'auto', padding: 0.5, height: '320px' }}>
          {steps[activeStep].content}
        </Box>
      </DialogContent>
      <DialogActions>{steps[activeStep].actions}</DialogActions>
    </Dialog>
  )
}

export default ContractDialog
