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
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs, { Dayjs } from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { OptionsObject as SnackbarOptions, useSnackbar } from 'notistack'
import React, { useEffect, useState } from 'react'

import subject from '../types/subject'
import { customer, teacher } from '../types/user'
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
  }[]
}

type form0 = {
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
}

const snackbarOptions: SnackbarOptions = {
  variant: 'error',
  anchorOrigin: {
    vertical: 'bottom',
    horizontal: 'right',
  },
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

  // step 0
  const [customers, setCustomers] = useState<customer[]>([])
  const [subjects, setSubjects] = useState<subject[]>([])
  const [loading0, setLoading0] = useState(false)
  const [form0, setForm0] = useState<form0>({
    customers: [],
    subject: null,
    interval: 1,
    startDate: null,
    endDate: null,
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
  })

  // get customers, subjects from DB
  useEffect(() => {
    API.get('users/customer').then((res) => setCustomers(res.data))
    API.get('subjects').then((res) => setSubjects(res.data))
  }, [])

  const validForm0 = !!(
    form0.customers.length &&
    form0.subject &&
    form0.interval
  )

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
        setActiveStep(1)
      })
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptions)
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
      const endTime = dayjs(suggestion.end, 'HH:mm')

      setForm1({
        startDate: getNextDow(
          suggestion.dow,
          form0.startDate ?? dayjs('00:00', 'HH:mm').add(1, 'day'),
        ),
        endDate: null,
        startTime: startTime,
        endTime: endTime,
        minTime: startTime,
        maxTime: endTime,
        teacher: teacher.teacherId.toString(),
        dow: suggestion.dow,
      })
    } else {
      setForm1({
        startDate: null,
        endDate: null,
        startTime: null,
        endTime: null,
        minTime: null,
        maxTime: null,
        teacher: '',
        dow: null,
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
    })
      .then(() => {
        onSuccess()
        setOpen(false)
      })
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptions)
      })
      .finally(() => setLoading1(false))
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
          <Autocomplete
            fullWidth
            multiple
            size="small"
            options={customers}
            getOptionLabel={(o) =>
              o.role === 'schoolCustomer'
                ? o.schoolName
                : o.firstName + ' ' + o.lastName
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={form0.customers}
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
                  variant="standard"
                  label="Fach"
                />
              )}
            />
            <TextField
              required
              label="Wochenintervall"
              variant="standard"
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
                  endDate: null,
                }))
              }}
              shouldDisableDate={(date) => [0, 6].includes(date.day())}
              renderInput={(params) => (
                <TextField {...params} variant="standard" />
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
              minDate={form0.startDate ?? undefined}
              defaultCalendarMonth={form0.startDate ?? undefined}
              disabled={form0.startDate === null}
              value={form0.endDate}
              onChange={(value) => {
                setForm0((data) => ({ ...data, endDate: value }))
              }}
              shouldDisableDate={(date) => [0, 6].includes(date.day())}
              renderInput={(params) => (
                <TextField {...params} variant="standard" />
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
          <EqualStack direction="row" spacing={2}>
            <BetterTimePicker
              label="Startzeit"
              minutesStep={5}
              maxTime={form0.endTime?.subtract(45, 'm')}
              value={form0.startTime}
              onChange={(value) => {
                setForm0((data) => ({ ...data, startTime: value }))
              }}
              clearValue={() => {
                setForm0((data) => ({ ...data, startTime: null }))
              }}
            />
            <BetterTimePicker
              label="Endzeit"
              minutesStep={5}
              minTime={form0.startTime?.add(45, 'm')}
              value={form0.endTime}
              onChange={(value) => {
                setForm0((data) => ({ ...data, endTime: value }))
              }}
              clearValue={() => {
                setForm0((data) => ({ ...data, endTime: null }))
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
          <FormControl variant="standard" fullWidth>
            <InputLabel htmlFor="suggestion-select">
              {suggestions.length > 0 ? 'Vorschläge' : 'Keine Vorschläge'}
            </InputLabel>
            <Select
              id="suggestion-select"
              disabled={suggestions.length === 0}
              value={selSuggestion}
              onChange={(e) => updateSelSuggestion(e.target.value)}
            >
              <MenuItem value="">freie Wahl</MenuItem>
              {suggestions.flatMap((t, i) => [
                <ListSubheader key={t.teacherId}>
                  {t.teacherName}
                </ListSubheader>,
                t.suggestions.map((s, j) => (
                  <MenuItem key={i + ',' + j} value={i + ',' + j}>
                    {`${dayjs().day(s.dow).format('dd')} ${s.start} - ${s.end}`}
                  </MenuItem>
                )),
              ])}
            </Select>
          </FormControl>

          <FormControl variant="standard" fullWidth required>
            <InputLabel htmlFor="teacher-select">Lehrkraft</InputLabel>
            <Select
              id="teacher-select"
              disabled={selSuggestion !== ''}
              value={form1.teacher}
              onChange={(e) =>
                setForm1((data) => ({ ...data, teacher: e.target.value }))
              }
            >
              {teachers.map((t) => (
                <MenuItem key={t.id} value={t.id.toString()}>
                  {`${t.firstName} ${t.lastName}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <EqualStack direction="row" spacing={2}>
            <DatePicker
              label="Startdatum"
              mask="__.__.____"
              minDate={form0.startDate ?? dayjs().add(1, 'd')}
              maxDate={form0.endDate ?? undefined}
              defaultCalendarMonth={form0.startDate ?? undefined}
              value={form1.startDate}
              onChange={(value) => {
                setForm1((data) => ({
                  ...data,
                  startDate: value,
                  endDate: null,
                }))
              }}
              shouldDisableDate={(day) =>
                [0, 6].includes(day.day()) ||
                (selSuggestion !== '' && day.day() !== form1.dow)
              }
              renderInput={(params) => (
                <TextField {...params} required variant="standard" />
              )}
              InputAdornmentProps={{
                position: 'start',
              }}
              InputProps={{
                endAdornment: (
                  <IconButtonAdornment
                    icon={ClearIcon}
                    hidden={form1.startDate === null}
                    onClick={() =>
                      setForm1((data) => ({
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
              minDate={form1.startDate ?? undefined}
              maxDate={form0.endDate ?? undefined}
              defaultCalendarMonth={form1.startDate ?? undefined}
              disabled={form1.startDate === null}
              value={form1.endDate}
              onChange={(value) => {
                setForm1((data) => ({ ...data, endDate: value }))
              }}
              shouldDisableDate={(day) =>
                !!(
                  form1.startDate &&
                  day.diff(form1.startDate, 'd') % (7 * form0.interval)
                )
              }
              renderInput={(params) => (
                <TextField {...params} variant="standard" />
              )}
              InputAdornmentProps={{
                position: 'start',
              }}
              InputProps={{
                endAdornment: (
                  <IconButtonAdornment
                    icon={ClearIcon}
                    hidden={form1.endDate === null}
                    onClick={() =>
                      setForm1((data) => ({ ...data, endDate: null }))
                    }
                  />
                ),
              }}
            />
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
        </Stack>
      ),
      actions: (
        <>
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
        <Box sx={{ overflow: 'auto', padding: 0.5, height: '320px' }}>
          {steps[activeStep].content}
        </Box>
      </DialogContent>
      <DialogActions>{steps[activeStep].actions}</DialogActions>
    </Dialog>
  )
}

export default ContractDialog
