import 'dayjs/locale/de'

import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  TextField,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import axios from 'axios'
import dayjs, { Dayjs } from 'dayjs'
import { useSnackbar } from 'notistack'
import { useState } from 'react'

import { snackbarOptionsError } from '../consts'
import { teacher } from '../types/user'
import { useAuth } from './AuthProvider'

type Props = {
  open: boolean
  closeDialog: () => void
  setTeachers: React.Dispatch<React.SetStateAction<teacher[]>>
}

type form = {
  firstName: string
  lastName: string
  email: string
  city: string
  dateOfApplication: Dayjs | null
  skip: boolean
}

const TeacherDialog: React.FC<Props> = ({ open, closeDialog, setTeachers }) => {
  const [form, setForm] = useState<form>({
    firstName: '',
    lastName: '',
    email: '',
    city: '',
    dateOfApplication: dayjs(),
    skip: false,
  })

  const { API } = useAuth()
  const { enqueueSnackbar } = useSnackbar()

  const submitForm = () => {
    API.post(`users/teacher`, {
      ...form,
      dateOfApplication: form.dateOfApplication?.format('YYYY-MM-DD'),
    })
      .then((res) => {
        setTeachers((s) => [...s, res.data])
        closeDialog()
      })
      .catch((error) => {
        if (axios.isAxiosError(error) && error.response?.status === 400) {
          enqueueSnackbar(
            (error.response.data as { message: string }).message,
            snackbarOptionsError,
          )
        } else {
          console.error(error)
          enqueueSnackbar('Ein Fehler ist aufgetreten.', snackbarOptionsError)
        }
      })
  }

  return (
    <Dialog open={open}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submitForm()
        }}
      >
        <DialogTitle>Lehrkraft hinzufügen</DialogTitle>
        <DialogContent sx={{ width: '500px' }}>
          <Stack
            direction={'column'}
            spacing={2}
            alignItems={'stretch'}
            sx={{ paddingTop: '15px' }}
          >
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                required
                variant="outlined"
                id="firstName"
                label="Vorname"
                value={form.firstName}
                onChange={(event) =>
                  setForm((data) => ({
                    ...data,
                    firstName: event.target.value,
                  }))
                }
              />
              <TextField
                fullWidth
                required
                variant="outlined"
                id="lastName"
                label="Nachname"
                value={form.lastName}
                onChange={(event) =>
                  setForm((data) => ({ ...data, lastName: event.target.value }))
                }
              />
            </Stack>
            <TextField
              fullWidth
              required
              type="email"
              variant="outlined"
              id="email"
              label="E-Mail"
              value={form.email}
              onChange={(event) =>
                setForm((data) => ({ ...data, email: event.target.value }))
              }
            />
            <TextField
              fullWidth
              required
              variant="outlined"
              id="city"
              label="Stadt"
              value={form.city}
              onChange={(event) =>
                setForm((data) => ({ ...data, city: event.target.value }))
              }
            />
            <DatePicker
              label="Bewerbungsdatum"
              mask="__.__.____"
              value={form.dateOfApplication}
              onChange={(value) => {
                setForm((data) => ({
                  ...data,
                  dateOfApplication: value,
                }))
              }}
              shouldDisableDate={(date) => [0, 6].includes(date.day())}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  variant="outlined"
                  inputProps={{
                    ...params.inputProps,
                    pattern: '\\d{2}\\.\\d{2}\\.\\d{4}',
                  }}
                />
              )}
              InputAdornmentProps={{
                position: 'start',
              }}
            />
            <FormControlLabel
              label="Direkt einstellen"
              control={
                <Checkbox
                  checked={form.skip}
                  onChange={(e) => {
                    setForm((data) => ({
                      ...data,
                      skip: e.target.checked,
                    }))
                  }}
                  inputProps={{ 'aria-label': 'controlled' }}
                />
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Abbrechen</Button>
          <Button variant="contained" type="submit">
            Hinzufügen
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default TeacherDialog
