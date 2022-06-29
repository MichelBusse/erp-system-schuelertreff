import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  FormLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material'
import axios from 'axios'
import { useSnackbar } from 'notistack'
import { useState } from 'react'

import AddTimes from '../components/AddTimes'
import { useAuth } from '../components/AuthProvider'
import { defaultPrivateCustomerFormData, snackbarOptionsError } from '../consts'
import { privateCustomerForm } from '../types/form'
import { privateCustomer } from '../types/user'
import { formValidation } from './FormValidation'

type Props = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  setCustomers: React.Dispatch<React.SetStateAction<privateCustomer[]>>
}

const PrivateCustomerDialog: React.FC<Props> = ({
  open,
  setOpen,
  setCustomers,
}) => {
  const [data, setData] = useState<privateCustomerForm>(
    defaultPrivateCustomerFormData,
  )
  const [errors, setErrors] = useState(defaultPrivateCustomerFormData)

  const { API } = useAuth()
  const { enqueueSnackbar } = useSnackbar()

  //TODO: validate filled fields
  const submitForm = () => {
    setErrors(formValidation('privateCustomer', data))

    if (formValidation('privateCustomer', data).validation)
      API.post(`users/privateCustomer`, {
        firstName: data.firstName,
        lastName: data.lastName,
        salutation: data.salutation,
        city: data.city,
        postalCode: data.postalCode,
        street: data.street,
        email: data.email,
        phone: data.phone,
        timesAvailable: data.timesAvailable.map((time) => ({
          dow: time.dow,
          start: time.start?.format('HH:mm'),
          end: time.end?.format('HH:mm'),
        })),
      })
        .then((res) => {
          setCustomers((s) => [...s, res.data])
          setOpen(false)
          setData(defaultPrivateCustomerFormData)
        })
        .catch((error) => {
          if (axios.isAxiosError(error) && error.response?.status === 400) {
            enqueueSnackbar(
              (error.response.data as any).message,
              snackbarOptionsError,
            )
          } else {
            console.error(error)
            enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptionsError)
          }
        })
  }

  const closeForm = () => {
    setOpen(false)
    setData(defaultPrivateCustomerFormData)
    setErrors(defaultPrivateCustomerFormData)
  }

  return (
    <Dialog open={open}>
      <DialogTitle>Privatkunden hinzufügen</DialogTitle>
      <DialogContent>
        <Stack
          direction={'column'}
          rowGap={3}
          alignItems={'stretch'}
          sx={{ paddingTop: '15px' }}
        >
          <Stack direction={'row'} columnGap={2}>
            <FormControl sx={{ width: '240px' }}>
              <InputLabel id="SalutationLable">Anrede</InputLabel>
              <Select
                id="Salutation"
                label="Anrede"
                value={data.salutation}
                onChange={(event) =>
                  setData((data) => ({
                    ...data,
                    salutation: event.target.value,
                  }))
                }
              >
                <MenuItem value="Herr">Herr</MenuItem>
                <MenuItem value="Frau">Frau</MenuItem>
                <MenuItem value="divers">divers</MenuItem>
              </Select>
              <FormHelperText>{errors.salutation}</FormHelperText>
            </FormControl>
            <TextField
              helperText={errors.firstName}
              id="firstName"
              label="Vorname"
              variant="outlined"
              required={true}
              fullWidth
              value={data.firstName}
              onChange={(event) =>
                setData((data) => ({ ...data, firstName: event.target.value }))
              }
            />
            <TextField
              helperText={errors.lastName}
              id="lastName"
              label="Nachname"
              variant="outlined"
              required={true}
              fullWidth
              value={data.lastName}
              onChange={(event) =>
                setData((data) => ({ ...data, lastName: event.target.value }))
              }
            />
          </Stack>
          <Stack direction={'row'} columnGap={2}>
            <TextField
              helperText={errors.city}
              id="city"
              label="Stadt"
              variant="outlined"
              required={true}
              fullWidth
              value={data.city}
              onChange={(event) =>
                setData((data) => ({ ...data, city: event.target.value }))
              }
            />
            <TextField
              helperText={errors.postalCode}
              id="postalCode"
              label="Postleitzahl"
              variant="outlined"
              required={true}
              sx={{ width: '300px' }}
              value={data.postalCode}
              onChange={(event) =>
                setData((data) => ({ ...data, postalCode: event.target.value }))
              }
            />
          </Stack>
          <Stack direction={'row'} columnGap={2}>
            <TextField
              helperText={errors.street}
              id="street"
              label="Straße"
              variant="outlined"
              required={true}
              fullWidth
              value={data.street}
              onChange={(event) =>
                setData((data) => ({ ...data, street: event.target.value }))
              }
            />
          </Stack>
          <Stack direction={'row'} columnGap={2}>
            <TextField
              helperText={errors.email}
              id="email"
              label="E-Mail Adresse"
              variant="outlined"
              required={true}
              fullWidth
              value={data.email}
              onChange={(event) =>
                setData((data) => ({ ...data, email: event.target.value }))
              }
            />
            <TextField
              helperText={errors.phone}
              id="phone"
              label="Telefonnummer"
              variant="outlined"
              required={true}
              sx={{ width: '50%' }}
              value={data.phone}
              onChange={(event) =>
                setData((data) => ({ ...data, phone: event.target.value }))
              }
            />
          </Stack>
          <Stack direction={'row'} columnGap={2}>
            <TextField
              type="number"
              id="grade"
              label="Klasse"
              variant="outlined"
              helperText={errors.grade}
              sx={{ width: '100px' }}
              value={data.grade}
              InputProps={{ inputProps: { min: 0, max: 13 } }}
              onChange={(event) =>
                setData((data) => ({
                  ...data,
                  grade: Number(event.target.value),
                }))
              }
            />
          </Stack>
          <FormControl>
            <FormLabel>Verfügbarkeit</FormLabel>
            <AddTimes data={data} setData={setData} />
          </FormControl>{' '}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeForm}>Abbrechen</Button>
        <Button onClick={submitForm}>Hinzufügen</Button>
      </DialogActions>
    </Dialog>
  )
}

export default PrivateCustomerDialog
