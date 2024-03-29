import 'dayjs/locale/de'

import { Clear } from '@mui/icons-material'
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
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { useAuth } from '../../../auth/components/AuthProvider'
import { SNACKBAR_OPTIONS_ERROR } from '../../../../core/res/Constants'
import IconButtonAdornment from '../../../general/components/IconButtonAdornment'
import Teacher from '../../../../core/types/Teacher'
import TeacherDialogFormState from '../../../../core/types/Form/TeacherDialogFormState'

type Props = {
  open: boolean
  closeDialog: () => void
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>
  teacherType?: 'employed' | 'applied'
}

const TeacherDialog: React.FC<Props> = ({
  open,
  closeDialog,
  setTeachers,
  teacherType,
}) => {
  const [form, setForm] = useState<TeacherDialogFormState>({
    firstName: '',
    lastName: '',
    email: '',
    applicationLocation: '',
    dateOfApplication: null,
    skip: teacherType === 'employed',
  })

  const { API } = useAuth()
  const { enqueueSnackbar } = useSnackbar()

  const submitForm = () => {
    API.post(`users/teacher`, {
      ...form,
      dateOfApplication: form.dateOfApplication?.format('YYYY-MM-DD'),
    })
      .then((res) => {
        if (
          (teacherType === 'applied' && form.skip === false) ||
          (teacherType === 'employed' && form.skip === true)
        ) {
          setTeachers((s) => [...s, res.data])
        }
        closeDialog()
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
        <DialogContent>
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
                setForm((data) => ({
                  ...data,
                  email: event.target.value.toLowerCase(),
                }))
              }
            />
            <TextField
              fullWidth
              variant="outlined"
              id="applicationLocation"
              label="Bewerbungsort"
              value={form.applicationLocation}
              onChange={(event) =>
                setForm((data) => ({
                  ...data,
                  applicationLocation: event.target.value,
                }))
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
              renderInput={(params) => (
                <TextField
                  {...params}
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
              InputProps={{
                endAdornment: (
                  <IconButtonAdornment
                    icon={Clear}
                    hidden={form.dateOfApplication === null}
                    onClick={() =>
                      setForm((f) => ({ ...f, dateOfApplication: null }))
                    }
                  />
                ),
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
