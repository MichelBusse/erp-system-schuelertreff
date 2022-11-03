import ClearIcon from '@mui/icons-material/Clear'
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
import { DatePicker } from '@mui/x-date-pickers'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'

import { snackbarOptions } from '../consts'
import { contractForm } from '../types/form'
import { customer } from '../types/user'
import { getNextDow } from '../utils/date'
import { useAuth } from './AuthProvider'
import BetterTimePicker from './BetterTimePicker'
import ConfirmationDialog, {
  ConfirmationDialogProps,
  defaultConfirmationDialogProps,
} from './ConfirmationDialog'
import IconButtonAdornment from './IconButtonAdornment'

dayjs.extend(customParseFormat)

type Props = {
  dialogInfo: { open: boolean; id: number }
  setDialogInfo: (open: boolean, id: number) => void
  onSuccess?: () => void
}

const ContractEditDialog: React.FC<Props> = ({
  dialogInfo,
  setDialogInfo,
  onSuccess = () => {},
}) => {
  const { API } = useAuth()
  const [customers, setCustomers] = useState<customer[]>([])
  const { enqueueSnackbar } = useSnackbar()
  const [confirmationDialogProps, setConfirmationDialogProps] =
    useState<ConfirmationDialogProps>(defaultConfirmationDialogProps)

  useEffect(() => {
    API.get('users/customer').then((res) => setCustomers(res.data))
  }, [])

  const [data, setData] = useState<contractForm>({
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

  const [prevContract, setPrevContract] = useState<contractForm>({
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
      const contract = {
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
    setConfirmationDialogProps({
      open: true,
      setProps: setConfirmationDialogProps,
      title: 'Vertrag wirklich ändern?',
      text: 'Möchtest du den Vertrag wirklich ändern?',
      action: () => {
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
          enqueueSnackbar('Vertrag geändert', snackbarOptions)
          setDialogInfo(false, -1)
          onSuccess()
        })
      },
    })
  }

  const deleteContract = () => {
    setConfirmationDialogProps({
      open: true,
      setProps: setConfirmationDialogProps,
      title: 'Einsatz wirklich löschen?',
      text: 'Es werden auch alle gehaltenen Stunden gelöscht und dieser Vorgang kann nicht mehr rückgängig gemacht werden.',
      action: () => {
        API.delete('contracts/' + dialogInfo.id).then(() => {
          enqueueSnackbar('Einsatz gelöscht', snackbarOptions)
          setDialogInfo(false, -1)
          onSuccess()
        })
      },
    })
  }
  const cancel = () => {
    setDialogInfo(false, -1)
  }

  return (
    <>
      <Dialog
        open={dialogInfo.open}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{'Einsatz bearbeiten'}</DialogTitle>
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
                o.role === 'privateCustomer'
                  ? o.firstName + ' ' + o.lastName
                  : o.className
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
              {prevContract.startDate?.isBefore(dayjs()) ? (
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
              ) : (
                <DatePicker
                  label="Startdatum"
                  mask="__.__.____"
                  minDate={dayjs().add(1, 'd')}
                  value={data.startDate}
                  onChange={(value) => {
                    setData((data) => ({
                      ...data,
                      startDate: value,
                      endDate: value ? value.add(1, 'year') : null,
                    }))
                  }}
                  shouldDisableDate={(date) => [0, 6].includes(date.day())}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      variant="outlined"
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
              )}
              <DatePicker
                label="Enddatum"
                mask="__.__.____"
                minDate={data.startDate?.add(1, 'day') ?? undefined}
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
                  setData((data) => ({
                    ...data,
                    startTime: null,
                    endTime: null,
                  }))
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
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmationDialog confirmationDialogProps={confirmationDialogProps} />
    </>
  )
}

export default ContractEditDialog
