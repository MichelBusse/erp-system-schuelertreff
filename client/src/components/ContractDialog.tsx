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
import { OptionsObject as SnackbarOptions, useSnackbar } from 'notistack'
import React, { useEffect, useState } from 'react'

import subject from '../types/subject'
import { customer } from '../types/user'
import { useAuth } from './AuthProvider'
import BetterTimePicker from './BetterTimePicker'
import EqualStack from './EqualStack'
import IconButtonAdornment from './IconButtonAdornment'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  onSuccess?: () => void
}

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

const snackbarOptions: SnackbarOptions = {
  variant: 'error',
  anchorOrigin: {
    vertical: 'bottom',
    horizontal: 'right',
  },
}

const ContractDialog: React.FC<Props> = ({
  open,
  setOpen,
  onSuccess = () => {},
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

  // get customers, subjects from DB
  useEffect(() => {
    API.get('users/customer').then((res) => setCustomers(res.data))
    API.get('subjects').then((res) => setSubjects(res.data))
  }, [])

  const handleSubmit0 = () => {
    // required fields
    if (form0.customers.length && form0.subject && form0.interval) {
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
          setSelSuggestion('')
          setSuggestions(res.data)
          setActiveStep(1)
        })
        .catch((err) => {
          console.error(err)
          enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptions)
        })
        .finally(() => setLoading0(false))
    }
  }

  const handleSubmit1 = () => {
    if (selSuggestion !== '') {
      setLoading1(true)

      API.post('contracts', {
        // teacher: suggestions[selSuggestion.teacher].teacherId,
        // customers: [5, 10],
        // subject: 2,
        // interval: 1,
        // startDate: '2022-06-17',
        // endDate: '2022-07-15',
        // startTime: '12:00',
        // endTime: '13:00',
      })
        .then(() => {
          onSuccess()
        })
        .catch((err) => {
          console.error(err)
          enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptions)
        })
        .finally(() => setLoading1(false))
    }

    //   if (formValid) {
    //     API.post('contracts', {
    //       ...form,
    //       customers: form.customers.map((c) => ({ id: c.id })),
    //       startDate: form.startDate?.format('YYYY-MM-DD'),
    //       endDate: form.endDate?.format('YYYY-MM-DD'),
    //       startTime: form.startTime?.format('HH:mm'),
    //       endTime: form.endTime?.format('HH:mm'),
    //     })
    //       .then(() => setOpen(false))
    //       .catch((err) => console.error(err))
    //   }
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
              shouldDisableDate={(day) =>
                !!(
                  form0.startDate &&
                  day.diff(form0.startDate, 'd') % (7 * form0.interval)
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
              maxTime={form0.endTime?.subtract(30, 'm')}
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
              minTime={form0.startTime?.add(30, 'm')}
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
              onChange={(e) => setSelSuggestion(e.target.value)}
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
        </Stack>
      ),
      actions: (
        <>
          <Button onClick={() => setActiveStep(0)}>Zurück</Button>
          <LoadingButton
            variant="contained"
            onClick={handleSubmit1}
            loading={loading1}
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
