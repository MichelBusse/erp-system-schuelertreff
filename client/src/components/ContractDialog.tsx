import 'dayjs/locale/de'

import ClearIcon from '@mui/icons-material/Clear'
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs, { Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'

import subject from '../types/subject'
import { customer, teacher } from '../types/user'
import { useAuth } from './AuthProvider'
import BetterTimePicker from './BetterTimePicker'
import EqualStack from './EqualStack'
import IconButtonAdornment from './IconButtonAdornment'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
}

type form = {
  customers: customer[]
  subject: subject | null
  interval: number
  startDate: Dayjs | null
  endDate: Dayjs | null
  startTime: Dayjs | null
  endTime: Dayjs | null
  teacher: teacher | null
}

const ContractDialog: React.FC<Props> = ({ open, setOpen }) => {
  const [form, setForm] = useState<form>({
    customers: [],
    subject: null,
    interval: 1,
    startDate: null,
    endDate: null,
    startTime: null,
    endTime: null,
    teacher: null,
  })

  const [customers, setCustomers] = useState<customer[]>([])
  const [subjects, setSubjects] = useState<subject[]>([])
  const [availableTeachers, setAvailableTeachers] = useState<teacher[]>([])

  const { API } = useAuth()

  // get customers, subjects from DB
  useEffect(() => {
    API.get('users/customer').then((res) => setCustomers(res.data))
    API.get('subjects').then((res) => setSubjects(res.data))
  }, [])

  // get available teachers from DB
  useEffect(() => {
    API.get('users/teacher/available', {
      params: {
        subject: form.subject?.id,
        interval: form.interval,
        startDate: form.startDate?.format('YYYY-MM-DD'),
        endDate: form.endDate?.format('YYYY-MM-DD'),
        startTime: form.startTime?.format('HH:mm'),
        endTime: form.endTime?.format('HH:mm'),
      },
    }).then((res) => {
      setForm((data) => ({ ...data, teacher: null }))
      setAvailableTeachers(res.data)
    })
  }, [
    form.subject,
    form.interval,
    form.startDate,
    form.endDate,
    form.startTime,
    form.endTime,
  ])

  const formValid = !!(
    form.customers.length &&
    form.subject &&
    form.startDate &&
    form.startTime &&
    form.endTime &&
    form.teacher
  )

  const submitForm = () => {
    if (formValid) {
      API.post('contracts', {
        ...form,
        customers: form.customers.map((c) => ({ id: c.id })),
        startDate: form.startDate?.format('YYYY-MM-DD'),
        endDate: form.endDate?.format('YYYY-MM-DD'),
        startTime: form.startTime?.format('HH:mm'),
        endTime: form.endTime?.format('HH:mm'),
      })
        .then(() => setOpen(false))
        .catch((err) => console.error(err))
    }
  }

  return (
    <Dialog open={open}>
      <DialogTitle>Contract hinzufügen</DialogTitle>
      <DialogContent>
        <Stack spacing={2} marginTop={1} width={400}>
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
            value={form.customers}
            onChange={(_, value) =>
              setForm((data) => ({ ...data, customers: value }))
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
              value={form.subject}
              onChange={(_, value) =>
                setForm((data) => ({ ...data, subject: value }))
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
              value={form.interval}
              onChange={(e) => {
                let value = parseInt(e.target.value, 10) || 1
                value = Math.max(1, Math.min(value, 4))

                setForm((data) => ({ ...data, interval: value, endDate: null }))
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
              value={form.startDate}
              onChange={(value) => {
                setForm((data) => ({
                  ...data,
                  startDate: value,
                  endDate: null,
                }))
              }}
              shouldDisableDate={(date) => [0, 6].includes(date.day())}
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
                    hidden={form.startDate === null}
                    onClick={() =>
                      setForm((data) => ({
                        ...data,
                        startDate: null,
                        endDate: null,
                      }))
                    }
                  />
                ),
              }}
            />
            <DatePicker
              label="Enddatum"
              mask="__.__.____"
              minDate={form.startDate ?? undefined}
              defaultCalendarMonth={form.startDate ?? undefined}
              disabled={form.startDate === null}
              value={form.endDate}
              onChange={(value) => {
                setForm((data) => ({ ...data, endDate: value }))
              }}
              shouldDisableDate={(day) =>
                !!(
                  form.startDate &&
                  day.diff(form.startDate, 'd') % (7 * form.interval)
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
                    hidden={form.endDate === null}
                    onClick={() =>
                      setForm((data) => ({ ...data, endDate: null }))
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
              required={true}
              maxTime={form.endTime?.subtract(30, 'm')}
              value={form.startTime}
              onChange={(value) => {
                setForm((data) => ({ ...data, startTime: value }))
              }}
              clearValue={() => {
                setForm((data) => ({ ...data, startTime: null }))
              }}
            />
            <BetterTimePicker
              label="Endzeit"
              minutesStep={5}
              required={true}
              minTime={form.startTime?.add(30, 'm')}
              value={form.endTime}
              onChange={(value) => {
                setForm((data) => ({ ...data, endTime: value }))
              }}
              clearValue={() => {
                setForm((data) => ({ ...data, endTime: null }))
              }}
            />
          </EqualStack>
          <Autocomplete
            fullWidth
            options={availableTeachers}
            getOptionLabel={(o) => o.firstName + ' ' + o.lastName}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            disabled={form.subject === null}
            value={form.teacher}
            onChange={(_, value) =>
              setForm((data) => ({ ...data, teacher: value }))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                required
                variant="standard"
                label="Lehrkraft"
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Abbrechen</Button>
        <Button onClick={submitForm}>Hinzufügen</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ContractDialog
