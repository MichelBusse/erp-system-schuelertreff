import styles from "../../../../core/styles/gridList.module.scss";

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
import { useAuth } from '../../../auth/components/AuthProvider'
import LoadingCenter from '../../../general/components/LoadingCenter'
import ErrorPage, { NotFound } from '../../../general/pages/Error'
import { snackbarOptions, snackbarOptionsError } from '../../../../core/res/consts'
import ContractDialog from "../../components/ContractDialog/ContractDialog";
import { Contract } from "../../../../core/types/Contract";
import LessonFormState from "../../../../core/types/Form/LessonFormState";
import LessonState from "../../../../core/enums/LessonState";


const LessonDetailView: React.FC = () => {
  const { API } = useAuth()
  const navigate = useNavigate()
  const { initialDate, contractId, date } = useParams()
  const { decodeToken } = useAuth()

  const { enqueueSnackbar } = useSnackbar()
  const [contractDialogOpen, setContractDialogOpen] = useState<boolean>(false)
  const [render, setRender] = useState(0)

  const [contract, setContract] = useState<Contract | undefined>()
  const [data, setData] = useState<LessonFormState>({
    state: LessonState.IDLE,
    notes: '',
  })
  const [blocked, setBlocked] = useState(false)
  const [pageStatus, setPageStatus] = useState<number>(0)

  useEffect(() => {
    API.get('lessons/' + contractId + '/' + date)
      .then((res) => {
        setContract(res.data.contract)

        setBlocked(res.data.blocked)

        const lesson = {
          state: res.data.lesson ? res.data.lesson.state : LessonState.IDLE,
          notes: res.data.lesson ? res.data.lesson.notes : '',
        }
        setData(lesson)

        setPageStatus(200)
      })
      .catch((err) => {
        console.log(err)
        setPageStatus(err?.response?.status ?? 500)
      })
  }, [])

  const submitForm = () => {
    API.post('lessons/', {
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

  switch (pageStatus) {
    case 0:
      return <LoadingCenter />

    case 404:
      return <NotFound />

    case 200:
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
                  value={
                    contract && contract.subject ? contract.subject.name : ''
                  }
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
                    contract && contract.startTime
                      ? dayjs(contract.startTime, 'HH:mm').format('HH:mm')
                      : ''
                  }
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Endzeit"
                  fullWidth
                  value={
                    contract && contract.endTime
                      ? dayjs(contract.endTime, 'HH:mm').format('HH:mm')
                      : ''
                  }
                  InputProps={{ readOnly: true }}
                />
              </Stack>
              <TextField
                variant="outlined"
                fullWidth={true}
                label="Lehrkraft"
                value={
                  contract?.teacher
                    ? contract.teacher.firstName +
                      ' ' +
                      contract.teacher.lastName
                    : 'Ausstehend'
                }
                InputProps={{
                  readOnly: true,
                }}
              />
              <Stack direction={'row'} columnGap={2}>
                {contract?.customers[0]?.role === 'classCustomer' && (
                  <TextField
                    variant="outlined"
                    fullWidth={true}
                    label="Schule"
                    value={contract.customers[0].school.schoolName}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                )}
                <TextField
                  variant="outlined"
                  fullWidth={true}
                  label={
                    contract?.customers[0]?.role === 'classCustomer'
                      ? 'Klasse(n)'
                      : 'Kunde(n)'
                  }
                  value={
                    contract
                      ? contract.customers
                          .map((c) => {
                            return c.role === 'privateCustomer'
                              ? c.firstName + ' ' + c.lastName
                              : c.className
                          })
                          .join(', ')
                      : ''
                  }
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Stack>
              {contract?.customers[0]?.role === 'classCustomer' && (
                <Stack direction={'row'} columnGap={2}>
                  <TextField
                    variant="outlined"
                    fullWidth={true}
                    label="Straße"
                    value={contract.customers[0].school.street}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                  <TextField
                    variant="outlined"
                    fullWidth={true}
                    label="Stadt"
                    value={contract.customers[0].school.city}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                  <TextField
                    variant="outlined"
                    fullWidth={true}
                    label="Potleitzahl"
                    value={contract.customers[0].school.postalCode}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Stack>
              )}
              <Stack direction={'row'} columnGap={2}>
                <FormControl fullWidth disabled={blocked}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    label="Satus"
                    value={data.state ?? ''}
                    onChange={(event) =>
                      setData((data) => ({
                        ...data,
                        state: event.target.value as LessonState,
                      }))
                    }
                  >
                    <MenuItem value={LessonState.IDLE}>Nicht gesetzt</MenuItem>
                    <MenuItem value={LessonState.HELD}>Gehalten</MenuItem>
                    <MenuItem value={LessonState.CANCELLED}>
                      Ausgefallen
                    </MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              <TextField
                label="Notizen"
                value={data.notes ?? ''}
                variant={'outlined'}
                multiline
                rows={3}
                disabled={blocked}
                onChange={(e) => {
                  setData((prevData) => ({
                    ...prevData,
                    notes: e.target.value,
                  }))
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
                <Button
                  onClick={submitForm}
                  variant="contained"
                  disabled={blocked}
                >
                  Speichern
                </Button>
              </Stack>
              <h3>Einsatzinfos</h3>
              <Stack direction={'row'} columnGap={2}>
                <TextField
                  label="Startdatum"
                  fullWidth
                  value={
                    contract && contract.startDate
                      ? dayjs(contract.startDate).format('DD.MM.YYYY')
                      : ''
                  }
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Enddatum"
                  fullWidth
                  value={
                    contract && contract.endDate
                      ? dayjs(contract.endDate).format('DD.MM.YYYY')
                      : ''
                  }
                  InputProps={{ readOnly: true }}
                />
              </Stack>
              <Stack direction={'row'} columnGap={2}>
                {decodeToken().role === 'admin' &&
                  contract &&
                  (!contract.endDate ||
                    dayjs(contract.endDate).isAfter(dayjs())) && (
                    <Button
                      variant="contained"
                      onClick={() => {
                        setRender(render + 1)
                        setContractDialogOpen(true)
                      }}
                    >
                      Einsatz bearbeiten
                    </Button>
                  )}
              </Stack>
            </Stack>
          </Box>
          <ContractDialog
            key={render}
            open={contractDialogOpen}
            setOpen={setContractDialogOpen}
            initialContract={contract}
            onSuccess={() => {
              navigate('/timetable')
            }}
          />
        </div>
      )

    default:
      return (
        <ErrorPage
          code={pageStatus.toString()}
          message="Ein Fehler ist aufgetreten"
        />
      )
  }
}

export default LessonDetailView
