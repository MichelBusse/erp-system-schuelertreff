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
import { customer } from '../types/user'

dayjs.extend(customParseFormat)

type Props = {
  dialogInfo: { open: boolean; id: number }
  setDialogInfo: (open : boolean, id : number) => void
}

type form = {
  startDate: Dayjs | null
  endDate: Dayjs | null
  startTime: Dayjs | null
  endTime: Dayjs | null
  teacher: string
  dow: number | null
  interval: number
  customers: customer[]
}

const ContractEditDialog: React.FC<Props> = ({ dialogInfo, setDialogInfo }) => {
  const { API } = useAuth()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const [customers, setCustomers] = useState<customer[]>([])
  useEffect(() => {
    API.get('users/customer').then((res) => setCustomers(res.data))
  }, [])

  const [data, setData] = useState<form>({
    startDate: null,
    endDate: null,
    startTime: null,
    endTime: null,
    teacher: '',
    dow: null,
    interval: 1,
    customers: []
  })

  useEffect(() => {
    if (dialogInfo.id === -1) return

    API.get('contracts/' + dialogInfo.id).then((res) => {
      console.log(res.data)
      setData((data) => ({
        startDate: res.data.startDate,
        endDate: res.data.endDate,
        startTime: dayjs(res.data.startTime, 'HH:mm'),
        endTime: dayjs(res.data.endTime, 'HH:mm'),
        teacher: res.data.teacher.firstName + ' ' + res.data.teacher.lastName,
        dow: res.data.dow,
        interval: res.data.interval,
        customers: res.data.customers
      }))
    })
  }, [dialogInfo])

  const submitForm = () => {
    API.post('contracts/' + dialogInfo.id, {
      ...data,
    }).then(() => {
      enqueueSnackbar('Änderungen gespeichert')
      navigate('/timetable')
    })
  }

  const deleteContract = () => {
    console.log('Delete Contract')
  }

  const cancel = () => {
    setDialogInfo(false, -1);
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
            value={data.teacher}
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
            <DatePicker
              label="Startdatum"
              mask="__.__.____"
              minDate={dayjs().add(1, 'd')}
              value={data.startDate}
              onChange={(value) => {
                setData((data) => ({
                  ...data,
                  startDate: value,
                  endDate: null,
                }))
              }}
              shouldDisableDate={(date) => [0, 6].includes(date.day())}
              renderInput={(params) => (
                <TextField {...params} variant="outlined" />
              )}
              InputAdornmentProps={{
                position: 'start',
              }}
              InputProps={{
                endAdornment: (
                  <IconButtonAdornment
                    icon={ClearIcon}
                    hidden={data.startDate === null}
                    onClick={() =>
                      setData((data) => ({
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
              minDate={data.startDate ?? undefined}
              maxDate={data.endDate ?? undefined}
              defaultCalendarMonth={data.startDate ?? undefined}
              disabled={data.startDate === null}
              value={data.endDate}
              onChange={(value) => {
                setData((data) => ({ ...data, endDate: value }))
              }}
              shouldDisableDate={(day) =>
                !!(
                  data.startDate &&
                  day.diff(data.startDate, 'd') % (7 * data.interval)
                )
              }
              renderInput={(params) => (
                <TextField {...params} variant="outlined" />
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
                  endTime: value?.add(45, 'minutes').isAfter(data.endTime) ? (value?.add(45, 'minutes') || null) : data.endTime,
                }})
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
        <Button onClick={deleteContract}>Beenden</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ContractEditDialog
