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
import { useSnackbar } from 'notistack'
import { useState } from 'react'

import { defaultSchoolFormData, snackbarOptionsError } from '../consts'
import { SchoolType } from '../types/enums'
import { schoolForm } from '../types/form'
import { school } from '../types/user'
import { defaultSchoolFormErrorTexts, schoolFormValidation } from '../utils/formValidation'
import { useAuth } from './AuthProvider'

type Props = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  setCustomers: React.Dispatch<React.SetStateAction<school[]>>
}

const SchoolDialog: React.FC<Props> = ({ open, setOpen, setCustomers }) => {
  const [data, setData] = useState<schoolForm>(defaultSchoolFormData)
  const [errors, setErrors] = useState(defaultSchoolFormErrorTexts)
  const {enqueueSnackbar} = useSnackbar()

  const { API } = useAuth()

  //TODO: validate filled fields
  const submitForm = () => {
    const errorTexts = schoolFormValidation(data)

    if (errorTexts.valid){
      API.post('users/school', data).then((res) => {
        setCustomers((s) => [...s, res.data])
        closeForm()
      })
    }else{
      setErrors(errorTexts)
      enqueueSnackbar('Überprüfe deine Eingaben', snackbarOptionsError)
    }
  }

  const closeForm = () => {
    setOpen(false)
    setData(defaultSchoolFormData)
    setErrors(defaultSchoolFormErrorTexts)
  }

  return (
    <Dialog open={open}>
      <DialogTitle>Schule hinzufügen</DialogTitle>
      <DialogContent>
        <Stack
          direction={'column'}
          rowGap={3}
          alignItems={'stretch'}
          sx={{ paddingTop: '15px' }}
        >
          <Stack direction={'row'} columnGap={2}>
            <TextField
              helperText={errors.schoolName}
              error={errors.schoolName !== ''}
              id="schoolName"
              label="Schulname"
              variant="outlined"
              required={true}
              fullWidth
              value={data.schoolName}
              onChange={(event) =>
                setData((data) => ({ ...data, schoolName: event.target.value }))
              }
            />
          </Stack>
          <Stack direction={'row'} columnGap={2}>
            <Autocomplete
              fullWidth
              multiple
              id="schoolTypes"
              options={[
                SchoolType.GRUNDSCHULE,
                SchoolType.OBERSCHULE,
                SchoolType.GYMNASIUM,
                SchoolType.ANDERE,
              ]}
              getOptionLabel={(option) => {
                switch (option) {
                  case SchoolType.GRUNDSCHULE:
                    return 'Grundschule'
                  case SchoolType.OBERSCHULE:
                    return 'Oberschule'
                  case SchoolType.GYMNASIUM:
                    return 'Gymnasium'
                  case SchoolType.ANDERE:
                    return 'Andere'
                  default:
                    return ''
                }
              }}
              renderInput={(params) => (
                <TextField {...params} variant="outlined" label="Schularten" />
              )}
              value={data.schoolTypes}
              onChange={(_, value) =>
                setData((data) => ({ ...data, schoolTypes: value }))
              }
            />
          </Stack>
          <Stack direction={'row'} columnGap={2}>
            <TextField
              helperText={errors.street}
              error={errors.street !== ''}
              id="street"
              label="Straße"
              variant="outlined"
              required={true}
              fullWidth={true}
              value={data.street}
              onChange={(event) =>
                setData((data) => ({ ...data, street: event.target.value }))
              }
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              helperText={errors.city}
              error={errors.city !== ''}
              id="city"
              label="Stadt"
              variant="outlined"
              required={true}
              fullWidth={true}
              value={data.city}
              onChange={(event) =>
                setData((data) => ({ ...data, city: event.target.value }))
              }
            />
            <TextField
              helperText={errors.postalCode}
              error={errors.postalCode !== ''}
              id="postalCode"
              label="Postleitzahl"
              variant="outlined"
              required={true}
              fullWidth={true}
              value={data.postalCode}
              onChange={(event) =>
                setData((data) => ({ ...data, postalCode: event.target.value }))
              }
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              helperText={errors.email}
              error={errors.email !== ''}
              id="email"
              label="E-Mail Adresse"
              variant="outlined"
              required={true}
              fullWidth={true}
              value={data.email}
              onChange={(event) =>
                setData((data) => ({ ...data, email: event.target.value }))
              }
            />
            <TextField
              helperText={errors.phone}
              error={errors.phone !== ''}
              id="phone"
              label="Telefonnummer"
              variant="outlined"
              required={true}
              fullWidth={true}
              value={data.phone}
              onChange={(event) =>
                setData((data) => ({ ...data, phone: event.target.value }))
              }
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeForm}>Abbrechen</Button>
        <Button onClick={submitForm}>Hinzufügen</Button>
      </DialogActions>
    </Dialog>
  )
}

export default SchoolDialog
