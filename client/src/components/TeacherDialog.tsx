import 'dayjs/locale/de'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material'
import axios from 'axios'
import { useSnackbar } from 'notistack'
import { useState } from 'react'

import { defaultTeacherFormData, snackbarOptionsError } from '../consts'
import { teacher } from '../types/user'
import { testEmail } from '../utils/formValidation'
import { useAuth } from './AuthProvider'

type Props = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  setTeachers: React.Dispatch<React.SetStateAction<teacher[]>>
}

const TeacherDialog: React.FC<Props> = ({ open, setOpen, setTeachers }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
  })

  const { API } = useAuth()
  const { enqueueSnackbar } = useSnackbar()

  const submitForm = () => {
    API.post(`users/teacher`, form)
      .then((res) => {
        setTeachers((s) => [...s, res.data])
        setOpen(false)
        setForm(defaultTeacherFormData)
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

  const closeForm = () => {
    setOpen(false)
    setForm(defaultTeacherFormData)
  }

  const formValid = !!(form.lastName && form.firstName && testEmail(form.email))

  return (
    <Dialog open={open}>
      <DialogTitle>Lehrkraft hinzufügen</DialogTitle>
      <DialogContent sx={{ width: '300px' }}>
        <Stack
          direction={'column'}
          rowGap={3}
          alignItems={'stretch'}
          sx={{ paddingTop: '15px' }}
        >
          <Stack direction={'column'} spacing={2}>
          <TextField
            fullWidth
            variant="outlined"
            id="firstName"
            label="Vorname"
            required={true}
            value={form.firstName}
            onChange={(event) =>
              setForm((data) => ({ ...data, firstName: event.target.value }))
            }
          />
          <TextField
            fullWidth
            variant="outlined"
            id="lastName"
            label="Nachname"
            required={true}
            value={form.lastName}
            onChange={(event) =>
              setForm((data) => ({ ...data, lastName: event.target.value }))
            }
          />
          <TextField
            fullWidth={true}
            required={true}
            id="email"
            label="E-Mail"
            variant="outlined"
            value={form.email}
            onChange={(event) =>
              setForm((data) => ({ ...data, email: event.target.value }))
            }
          />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeForm}>Abbrechen</Button>
        <Button variant="contained" disabled={!formValid} onClick={submitForm}>
          Hinzufügen
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default TeacherDialog
