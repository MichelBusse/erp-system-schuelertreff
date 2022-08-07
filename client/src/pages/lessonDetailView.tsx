import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Box } from '@mui/system'
import dayjs from 'dayjs'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '../components/AuthProvider'
import ContractEditDialog from '../components/ContractEditDialog'
import { snackbarOptions, snackbarOptionsError } from '../consts'
import styles from '../pages/gridList.module.scss'
import { contractForm, lessonForm } from '../types/form'
import { LessonState } from '../types/lesson'

const LessonDetailView: React.FC = () => {
  const { API } = useAuth()
  const navigate = useNavigate()
  const { initialDate, contractId, date } = useParams()
  const [id, setId] = useState<number | null>(null)
  const { decodeToken } = useAuth()
  const [refresh, setRefresh] = useState(0)

  const { enqueueSnackbar } = useSnackbar()
  const [contractDetailsDialog, setContractDetailsDialog] = useState<{
    open: boolean
    id: number
  }>({ open: false, id: -1 })

  const [contract, setContract] = useState<contractForm>({
    startTime: null,
    endTime: null,
    startDate: null,
    endDate: null,
    interval: 0,
    subject: null,
    customers: [],
    teacher: null,
    dow: null,
  })
  const [data, setData] = useState<lessonForm>({
    state: LessonState.IDLE,
    notes: '',
  })
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    API.get('lessons/' + contractId + '/' + date).then((res) => {
      const contract = {
        startDate: dayjs(res.data.contract.startDate),
        endDate: dayjs(res.data.contract.endDate),
        startTime: dayjs(res.data.contract.startTime, 'HH:mm'),
        endTime: dayjs(res.data.contract.endTime, 'HH:mm'),
        teacher: res.data.contract.teacher,
        dow: res.data.contract.dow,
        interval: res.data.contract.interval,
        customers: res.data.contract.customers,
        subject: res.data.contract.subject,
      }

      setContract(contract)

      setBlocked(res.data.blocked)

      const lesson = {
        state: res.data.lesson ? res.data.lesson.state : LessonState.IDLE,
        notes: res.data.lesson.notes,
      }
      setId(res.data?.id)
      setData(lesson)
    })
  }, [refresh])

  const submitForm = () => {
    API.post('lessons/' + (id ?? ''), {
      date: dayjs(date, 'YYYY-MM-DD').format('YYYY-MM-DD'),
      contractId: parseInt(contractId ?? ''),
      ...data,
    })
      .then(() => {
        enqueueSnackbar('Stunde gespeichert', snackbarOptions)
        navigate('/timetable/' + (initialDate ?? ''))
      })
      .catch((err) => {
        console.error(err)
        enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptionsError)
      })
  }

  return (
    <div className={styles.wrapper}>
      <Box
        sx={{
          flexGrow: 1,
          backgroundColor: '#ffffff',
          padding: '30px',
          boxSizing: 'border-box',
          borderRadius: '25px',
        }}
      >
        <Stack direction="column" alignItems={'stretch'} rowGap={2}>
          <h3>Stundeninfos</h3>
          <Stack direction={'row'} columnGap={2}>
            <TextField
              variant="outlined"
              fullWidth={true}
              label="Fach"
              value={contract.subject ? contract.subject.name : ''}
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              variant="outlined"
              fullWidth={true}
              label="Datum"
              value={
                dayjs(date, 'YYYY-MM-DD').format('dddd / DD.MM.YYYY') ?? ''
              }
              InputProps={{
                readOnly: true,
              }}
            />
          </Stack>
          <Stack direction={'row'} columnGap={2}>
            <TextField
              label="Startzeit"
              fullWidth
              value={
                contract.startTime ? contract.startTime.format('HH:mm') : ''
              }
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Endzeit"
              fullWidth
              value={contract.endTime ? contract.endTime.format('HH:mm') : ''}
              InputProps={{ readOnly: true }}
            />
          </Stack>
          <TextField
            variant="outlined"
            fullWidth={true}
            label="Kunde(n)"
            value={
              contract.customers
                .map((c) => {
                  return c.role === 'privateCustomer'
                    ? c.firstName + ' ' + c.lastName
                    : c.school.schoolName + ': ' + c.className
                })
                .join(', ') ?? ''
            }
            InputProps={{
              readOnly: true,
            }}
          />
          <Stack direction={'row'} columnGap={2}>
            <FormControl fullWidth disabled={blocked}>
              <InputLabel>Status</InputLabel>
              <Select
                label="Satus"
                value={data.state}
                onChange={(event) =>
                  setData((data) => ({
                    ...data,
                    state: event.target.value as LessonState,
                  }))
                }
              >
                <MenuItem value={LessonState.IDLE}>Nicht gesetzt</MenuItem>
                <MenuItem value={LessonState.HELD}>Gehalten</MenuItem>
                <MenuItem value={LessonState.CANCELLED}>Ausgefallen</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <TextField
            label="Notizen"
            value={data.notes}
            variant={'outlined'}
            multiline
            rows={3}
            onChange={(e) => {
              setData((prevData) => ({ ...prevData, notes: e.target.value }))
            }}
          />
          {blocked && (
            <Typography>
              Stunde ist durch Krankmeldung oder Urlaub blockiert.
            </Typography>
          )}
          <Stack direction={'row'} columnGap={2}>
            <Button
              onClick={() => {
                navigate('/timetable/' + (initialDate ?? ''))
              }}
              variant="outlined"
            >
              Abbrechen
            </Button>
            <Button onClick={submitForm} variant="contained" disabled={blocked}>
              Speichern
            </Button>
          </Stack>
          <h3>Einsatzinfos</h3>
          <Stack direction={'row'} columnGap={2}>
            <TextField
              label="Startdatum"
              fullWidth
              value={
                contract.startDate
                  ? contract.startDate.format('DD.MM.YYYY')
                  : ''
              }
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Enddatum"
              fullWidth
              value={
                contract.endDate ? contract.endDate.format('DD.MM.YYYY') : ''
              }
              InputProps={{ readOnly: true }}
            />
          </Stack>
          <Stack direction={'row'} columnGap={2}>
            {decodeToken().role === 'admin' &&
              dayjs(contract.endDate).isAfter(dayjs()) && (
                <Button
                  variant="contained"
                  onClick={() =>
                    setContractDetailsDialog({
                      open: true,
                      id: contractId as unknown as number,
                    })
                  }
                >
                  Einsatz bearbeiten
                </Button>
              )}
          </Stack>
        </Stack>
      </Box>
      <ContractEditDialog
        dialogInfo={contractDetailsDialog}
        setDialogInfo={(open: boolean, id: number) =>
          setContractDetailsDialog({ open: open, id: id })
        }
        onSuccess={() => {
          setRefresh((re) => ++re)
        }}
      />
    </div>
  )
}

export default LessonDetailView
