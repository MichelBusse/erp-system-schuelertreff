import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material'
import Box from '@mui/material/Box'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { nanoid } from 'nanoid'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import AddTimes from '../components/AddTimes'
import { useAuth } from '../components/AuthProvider'
import InvoiceDataSelect, { InvoiceData } from '../components/InvoiceDateSelect'
import UserDocuments from '../components/UserDocuments'
import {
  defaultPrivateCustomerFormData,
  snackbarOptions,
  snackbarOptionsError,
} from '../consts'
import styles from '../pages/gridList.module.scss'
import { SchoolType } from '../types/enums'
import { privateCustomerForm } from '../types/form'
import { Role, timesAvailableParsed } from '../types/user'
import { formValidation } from '../utils/formValidation'

dayjs.extend(customParseFormat)

const PrivateCustomerDetailView: React.FC = () => {
  const { API } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)

  const requestedId = id ? id : 'me'

  const [data, setData] = useState<privateCustomerForm>(
    defaultPrivateCustomerFormData,
  )
  const [errors, setErrors] = useState({
    ...defaultPrivateCustomerFormData,
    grade: '',
    fee: '',
  })

  useEffect(() => {
    API.get('users/privateCustomer/' + requestedId).then((res) => {
      const newTimesAvailable =
        res.data.timesAvailableParsed.length === 1 &&
        res.data.timesAvailableParsed[0].dow === 1 &&
        res.data.timesAvailableParsed[0].start === '00:00' &&
        res.data.timesAvailableParsed[0].end === '00:00'
          ? []
          : res.data.timesAvailableParsed.map((time: timesAvailableParsed) => ({
              dow: time.dow,
              start: dayjs(time.start, 'HH:mm'),
              end: dayjs(time.end, 'HH:mm'),
              id: nanoid(),
            }))

      setData((data) => ({
        ...data,
        firstName: res.data.firstName,
        lastName: res.data.lastName,
        city: res.data.city,
        postalCode: res.data.postalCode,
        street: res.data.street,
        email: res.data.email,
        phone: res.data.phone,
        timesAvailable: newTimesAvailable,
        grade: res.data.grade,
        schoolType: res.data.schoolType,
        feeStandard: res.data.feeStandard,
        feeOnline: res.data.feeOnline,
        notes: res.data.notes,
      }))
    })
  }, [])

  const submitForm = () => {
    setErrors(formValidation('privateCustomer', data))

    if (formValidation('privateCustomer', data).validation) {
      API.post('users/privateCustomer/' + requestedId, {
        ...data,
        timesAvailable: data.timesAvailable.map((time) => ({
          dow: time.dow,
          start: time.start?.format('HH:mm'),
          end: time.end?.format('HH:mm'),
        })),
      }).then(() => {
        enqueueSnackbar(
          data.firstName + ' ' + data.lastName + ' gespeichert',
          snackbarOptions,
        )
        if (id) navigate('/privateCustomers')
      })
    }
  }

  const deleteUser = () => {
    setDialogOpen(false)

    API.delete('users/privateCustomer/' + requestedId)
      .then(() => {
        enqueueSnackbar(
          data.firstName + ' ' + data.lastName + ' gelöscht',
          snackbarOptions,
        )
        navigate('/privateCustomers')
      })
      .catch(() => {
        enqueueSnackbar(
          data.firstName +
            ' ' +
            data.lastName +
            ' kann nicht gelöscht werden, da noch laufende Verträge existieren.',
          snackbarOptionsError,
        )
      })
  }

  const generateInvoice = (
    year: number,
    month: number,
    invoiceData?: InvoiceData,
  ) => {
    API.post(
      'lessons/invoice/customer',
      {
        ...invoiceData,
        invoiceDate: invoiceData?.invoiceDate.format('YYYY-MM-DD'),
      },
      {
        params: {
          of: dayjs().year(year).month(month).format('YYYY-MM-DD'),
          customerId: id,
        },
        responseType: 'blob',
      },
    )
      .then((res) => {
        window.open(URL.createObjectURL(res.data))
      })
      .catch(() => {
        enqueueSnackbar('Ein Fehler ist aufgetreten', snackbarOptionsError)
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
        <Stack direction="column" alignItems={'stretch'}>
          <h3>Person:</h3>
          <Stack direction="row" columnGap={2}>
            <TextField
              helperText={errors.firstName}
              fullWidth={true}
              label="Vorname"
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  firstName: event.target.value,
                }))
              }
              value={data.firstName}
              InputProps={{
                readOnly: requestedId === 'me',
              }}
            />
            <TextField
              helperText={errors.lastName}
              fullWidth={true}
              label="Nachname"
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  lastName: event.target.value,
                }))
              }
              value={data.lastName}
              InputProps={{
                readOnly: requestedId === 'me',
              }}
            />
          </Stack>
          <h3>Adresse:</h3>
          <Stack direction={{xs: "column", sm:"row"}} spacing={2}>
            <TextField
              helperText={errors.street}
              label="Straße"
              fullWidth={true}
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  street: event.target.value,
                }))
              }
              value={data.street}
              InputProps={{
                readOnly: false,
              }}
            />
            <TextField
              label="Postleitzahl"
              helperText={errors.postalCode}
              fullWidth={true}
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  postalCode: event.target.value,
                }))
              }
              value={data.postalCode}
              InputProps={{
                readOnly: false,
              }}
            />
            <TextField
              label="Stadt"
              helperText={errors.city}
              fullWidth={true}
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  city: event.target.value,
                }))
              }
              value={data.city}
              InputProps={{
                readOnly: false,
              }}
            />
          </Stack>
          <h3>Kontakt:</h3>
          <Stack direction={{xs: "column", sm:"row"}} spacing={2}>
            <TextField
              fullWidth={true}
              helperText={errors.email}
              label="Email"
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  email: event.target.value,
                }))
              }
              value={data.email}
              InputProps={{
                readOnly: requestedId === 'me',
              }}
            />

            <TextField
              fullWidth={true}
              helperText={errors.phone}
              label="Telefonnummer"
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  phone: event.target.value,
                }))
              }
              value={data.phone}
            />
          </Stack>
          <h3>Weitere Infos:</h3>
          <Stack direction="row" columnGap={2}>
            <FormControl fullWidth>
              <InputLabel id="invoiceMonthLabel">Schulart</InputLabel>
              <Select
                label={'Schulart'}
                fullWidth
                value={data.schoolType ?? ''}
                onChange={(e) => {
                  setData((c) => ({
                    ...c,
                    schoolType: e.target.value as SchoolType,
                  }))
                }}
              >
                <MenuItem value={SchoolType.GRUNDSCHULE}>Grundschule</MenuItem>
                <MenuItem value={SchoolType.OBERSCHULE}>Oberschule</MenuItem>
                <MenuItem value={SchoolType.GYMNASIUM}>Gymnasium</MenuItem>
                <MenuItem value={SchoolType.ANDERE}>Andere</MenuItem>
              </Select>
            </FormControl>
            <TextField
              type="number"
              id="grade"
              label="Klasse"
              variant="outlined"
              helperText={errors.grade}
              fullWidth
              value={data.grade ?? ''}
              InputProps={{ inputProps: { min: 0, max: 13 } }}
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  grade: parseInt(event.target.value),
                }))
              }
            />
            <TextField
              type="number"
              id="fee"
              label="Stundensatz Präsenz"
              variant="outlined"
              fullWidth
              disabled={requestedId === 'me'}
              value={data.feeStandard ?? ''}
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  feeStandard: Number(event.target.value),
                }))
              }
            />
            <TextField
              type="number"
              id="fee"
              label="Stundensatz Online"
              variant="outlined"
              fullWidth
              disabled={requestedId === 'me'}
              value={data.feeOnline ?? ''}
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  feeOnline: Number(event.target.value),
                }))
              }
            />
          </Stack>
          <h3>Verfügbarkeit:</h3>
          <Box>
            <AddTimes
              value={data.timesAvailable}
              setValue={(newValue) =>
                setData((data) => ({ ...data, timesAvailable: newValue }))
              }
            />
          </Box>
          <h3>Notizen</h3>
          <TextField
            multiline
            value={data.notes}
            onChange={(e) => {
              setData((data) => ({ ...data, notes: e.target.value }))
            }}
            fullWidth
            rows={3}
          />
          <Stack direction={{xs: "column", sm:"row"}} spacing={2} sx={{ marginTop: '15px' }}>
            {id && (
              <Button
                onClick={() => {
                  navigate('/privateCustomers')
                }}
                variant="outlined"
              >
                Abbrechen
              </Button>
            )}
            <Button onClick={submitForm} variant="contained">
              Speichern
            </Button>
            {id && (
              <Button
                variant="outlined"
                onClick={() => setDialogOpen(true)}
                sx={{ marginLeft: 'auto' }}
                color="error"
              >
                Entfernen
              </Button>
            )}
          </Stack>

          <h3>Dokumente:</h3>
          <UserDocuments
            userId={requestedId !== 'me' ? parseInt(requestedId) : undefined}
          />

          <h3>Rechnung generieren:</h3>
          <InvoiceDataSelect
            generateInvoice={generateInvoice}
            type={Role.PRIVATECUSTOMER}
          />
        </Stack>
      </Box>
      <Dialog
        open={dialogOpen}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{'Schüler:in wirklich löschen?'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Schüler:innen können nur gelöscht werden, wenn sie in keinen
            laufenden oder zukünftigen Verträgen mehr eingeplant sind.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={deleteUser}>Löschen</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default PrivateCustomerDetailView
