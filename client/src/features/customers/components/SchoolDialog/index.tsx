import { Clear } from '@mui/icons-material'
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
import axios from 'axios'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { useAuth } from '../../../auth/components/AuthProvider'
import IconButtonAdornment from '../../../general/components/IconButtonAdornment'
import SchoolFormState from '../../../../core/types/Form/SchoolFormState'
import School from '../../../../core/types/School'
import SchoolType from '../../../../core/enums/SchoolType'
import { schoolFormValidation } from '../../../../core/utils/FormValidation'
import { DEFAULT_SCHOOL_FORM_ERROR_TEXTS, DEFAULT_SCHOOL_FORM_STATE } from '../../../../core/res/Defaults'
import { SNACKBAR_OPTIONS_ERROR } from '../../../../core/res/Constants'


type Props = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  setCustomers: React.Dispatch<React.SetStateAction<School[]>>
}

const SchoolDialog: React.FC<Props> = ({ open, setOpen, setCustomers }) => {
  const [data, setData] = useState<SchoolFormState>(DEFAULT_SCHOOL_FORM_STATE)
  const [errors, setErrors] = useState(DEFAULT_SCHOOL_FORM_ERROR_TEXTS)
  const { enqueueSnackbar } = useSnackbar()

  const { API } = useAuth()

  //TODO: validate filled fields
  const submitForm = () => {
    const errorTexts = schoolFormValidation(data)

    if (errorTexts.valid) {
      API.post('users/school', {
        ...data,
        dateOfStart: data.dateOfStart?.format(),
      })
        .then((res) => {
          setCustomers((s) => [...s, res.data])
          closeForm()
        })
        .catch((error) => {
          if (axios.isAxiosError(error) && error.response?.status === 400) {
            enqueueSnackbar(
              (error.response.data as { message: string }).message,
              SNACKBAR_OPTIONS_ERROR,
            )
          } else {
            console.error(error)
            enqueueSnackbar('Ein Fehler ist aufgetreten.', SNACKBAR_OPTIONS_ERROR)
          }
        })
    } else {
      setErrors(errorTexts)
      enqueueSnackbar('Überprüfe deine Eingaben', SNACKBAR_OPTIONS_ERROR)
    }
  }

  const closeForm = () => {
    setOpen(false)
    setData(DEFAULT_SCHOOL_FORM_STATE)
    setErrors(DEFAULT_SCHOOL_FORM_ERROR_TEXTS)
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
                setData((data) => ({
                  ...data,
                  email: event.target.value.toLowerCase(),
                }))
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
              fullWidth={true}
              value={data.postalCode}
              onChange={(event) =>
                setData((data) => ({ ...data, postalCode: event.target.value }))
              }
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              helperText={errors.phone}
              error={errors.phone !== ''}
              id="phone"
              label="Telefonnummer"
              variant="outlined"
              fullWidth={true}
              value={data.phone}
              onChange={(event) =>
                setData((data) => ({ ...data, phone: event.target.value }))
              }
            />
            <DatePicker
              label="Startdatum"
              mask="__.__.____"
              value={data.dateOfStart}
              onChange={(value) => {
                setData((d) => ({ ...d, dateOfStart: value }))
              }}
              renderInput={(params) => (
                <TextField
                  fullWidth
                  {...params}
                  variant="outlined"
                  helperText={errors.dateOfStart}
                  error={errors.dateOfStart !== ''}
                />
              )}
              InputAdornmentProps={{
                position: 'start',
              }}
              InputProps={{
                endAdornment: (
                  <IconButtonAdornment
                    icon={Clear}
                    hidden={data.dateOfStart === null}
                    onClick={() =>
                      setData((d) => ({ ...d, dateOfStart: null }))
                    }
                  />
                ),
              }}
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
