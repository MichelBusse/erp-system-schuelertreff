import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import dayjs, { Dayjs } from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from './AuthProvider'
import BetterTimePicker from './BetterTimePicker'
import { DatePicker } from '@mui/x-date-pickers'
import IconButtonAdornment from './IconButtonAdornment'
import { customer, teacher } from '../types/user'
import { getNextDow } from '../utils/date'
import subject from '../types/subject'

dayjs.extend(customParseFormat)

type Props = {
  dialogInfo: { open: boolean; id: number }
  setDialogInfo: (open: boolean, id: number) => void
}

type form = {
  startDate: Dayjs | null
  endDate: Dayjs | null
  startTime: Dayjs | null
  endTime: Dayjs | null
  teacher: teacher | null
  dow: number | null
  interval: number
  customers: customer[]
  subject: subject | null
}

const ContractEditDialog: React.FC<Props> = ({ dialogInfo, setDialogInfo }) => {
  const { API } = useAuth()
  const [customers, setCustomers] = useState<customer[]>([])
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()

  useEffect(() => {
    API.get('users/customer').then((res) => setCustomers(res.data))
  }, [])

  const [data, setData] = useState<form>({
    startDate: null,
    endDate: null,
    startTime: null,
    endTime: null,
    teacher: null,
    dow: null,
    interval: 1,
    customers: [],
    subject: null,
  })

  const [prevContract, setPrevContract] = useState<form>({
    startDate: null,
    endDate: null,
    startTime: null,
    endTime: null,
    teacher: null,
    dow: null,
    interval: 1,
    customers: [],
    subject: null,
  })

  useEffect(() => {
    if (dialogInfo.id === -1) return

    API.get('contracts/' + dialogInfo.id).then((res) => {
      let contract = {
        startDate: dayjs(res.data.startDate),
        endDate: dayjs(res.data.endDate),
        startTime: dayjs(res.data.startTime, 'HH:mm'),
        endTime: dayjs(res.data.endTime, 'HH:mm'),
        teacher: res.data.teacher,
        dow: res.data.dow,
        interval: res.data.interval,
        customers: res.data.customers,
        subject: res.data.subject,
      }
      setPrevContract(contract)
      setData({ ...contract })
    })
  }, [dialogInfo])

  const submitForm = () => {
    if (window.confirm('Vertrag wirklich ändern?'))
      API.post('contracts/' + dialogInfo.id, {
        customers: data.customers.map((c) => c.id),
        subject: data.subject?.id,
        interval: data.interval,
        teacher: data.teacher?.id,
        startDate: data.startDate?.format('YYYY-MM-DD'),
        endDate: data.endDate?.format('YYYY-MM-DD'),
        startTime: data.startTime?.format('HH:mm'),
        endTime: data.endTime?.format('HH:mm'),
      }).then(() => {
        enqueueSnackbar('Vertrag geändert')
        setDialogInfo(false, -1)
      })
  }

  const deleteContract = () => {
    if (window.confirm('Vertrag wirklich beenden?'))
      API.delete('contracts/' + dialogInfo.id).then(() => {
        enqueueSnackbar('Vertrag beendet')
        setDialogInfo(false, -1)
      })
  }
  const cancel = () => {
    setDialogInfo(false, -1)
  }

  return (
    <Dialog
      open={dialogInfo.open}
      keepMounted
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>{'Vertrag bearbeiten'}</DialogTitle>
      <DialogContent
        sx={{
          width: 500,
          '& .MuiStepConnector-root': {
            maxWidth: '100px',
          },
        }}
      >
        <Stack rowGap={2} sx={{ paddingTop: '10px' }}>
          <TextField
            variant="outlined"
            fullWidth={true}
            label="Lehrkraft"
            value={data.teacher?.firstName + ' ' + data.teacher?.lastName}
            InputProps={{
              readOnly: true,
            }}
          />
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
            value={data.customers}
            onChange={(_, value) =>
              setData((data) => ({ ...data, customers: value }))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                required
                size="medium"
                variant="outlined"
                label="Kunde(n)"
              />
            )}
          />
          <Stack direction={'row'} columnGap={2}>
            <TextField
              label="Startdatum"
              fullWidth
              value={
                prevContract.startDate
                  ? prevContract.startDate.format('DD.MM.YYYY')
                  : ''
              }
              InputProps={{ readOnly: true }}
            />
            <DatePicker
              label="Enddatum"
              mask="__.__.____"
              minDate={data.startDate?.add(8, 'day') ?? undefined}
              defaultCalendarMonth={data.startDate ?? undefined}
              disabled={data.startDate === null}
              value={data.endDate}
              onChange={(value) => {
                setData((data) => ({ ...data, endDate: value }))
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
                    hidden={data.endDate === null}
                    onClick={() =>
                      setData((data) => ({ ...data, endDate: null }))
                    }
                  />
                ),
              }}
            />
          </Stack>
          <Stack direction={'row'} columnGap={2}>
            <FormControl variant="outlined" fullWidth required>
              <InputLabel htmlFor="weekday-select">Wochentag</InputLabel>
              <Select
                id="weekday-select"
                label={'Wochentag'}
                value={data.startDate ? data.startDate.day() : 1}
                onChange={(e) => {
                  setData((data) => ({
                    ...data,
                    startDate: data.startDate
                      ? getNextDow(
                          e.target.value as number,
                          dayjs().add(1, 'day'),
                        )
                      : null,
                  }))
                }}
              >
                <MenuItem value={1}>Montag</MenuItem>
                <MenuItem value={2}>Dienstag</MenuItem>
                <MenuItem value={3}>Mittwoch</MenuItem>
                <MenuItem value={4}>Donnerstag</MenuItem>
                <MenuItem value={5}>Freitag</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <Stack direction={'row'} columnGap={2}>
            <BetterTimePicker
              label="Startzeit"
              required
              minutesStep={5}
              value={data.startTime}
              onChange={(value) => {
                setData((data) => {
                  return {
                    ...data,
                    startTime: value,
                    endTime: value?.add(45, 'minutes').isAfter(data.endTime)
                      ? value?.add(45, 'minutes') || null
                      : data.endTime,
                  }
                })
              }}
              clearValue={() => {
                setData((data) => ({ ...data, startTime: null, endTime: null }))
              }}
            />
            <BetterTimePicker
              label="Endzeit"
              required
              minutesStep={5}
              minTime={data.startTime?.add(45, 'm')}
              value={data.endTime}
              onChange={(value) => {
                setData((data) => ({ ...data, endTime: value }))
              }}
              clearValue={() => {
                setData((data) => ({ ...data, endTime: null }))
              }}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={cancel}>Abbrechen</Button>
        <Button onClick={submitForm}>Speichern</Button>
        <Button onClick={deleteContract} color="error">
          Beenden
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ContractEditDialog