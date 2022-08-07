import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'
import { SketchPicker } from 'react-color'

import { useAuth } from '../components/AuthProvider'
import { snackbarOptionsError } from '../consts'
import subject from '../types/subject'
import { formValidation } from '../utils/formValidation'

type Props = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  setSubjects: React.Dispatch<React.SetStateAction<subject[]>>
  initialSubject: subject | null
}

const defaultFormData = {
  color: '#FF0000',
  name: '',
  shortForm: '',
}

const SubjectDialog: React.FC<Props> = ({
  open,
  setOpen,
  setSubjects,
  initialSubject,
}) => {
  const [data, setData] = useState(defaultFormData)
  const [errors, setErrors] = useState(defaultFormData)
  const { enqueueSnackbar } = useSnackbar()

  const { API } = useAuth()

  //TODO: validate filled fields
  const submitForm = () => {
    setErrors(formValidation('subject', data))

    if (formValidation('subject', data).validation)
      if (initialSubject) {
        API.post('subjects/' + initialSubject.id, data).then((res) => {
          setSubjects((s) => {
            const newSubjects = [...s]
            s.forEach((subject, index) => {
              if (subject.id === initialSubject.id) {
                newSubjects[index] = res.data
              }
            })
            return newSubjects
          })
          setData(defaultFormData)
          setOpen(false)
        })
      } else {
        API.post('subjects', data).then((res) => {
          setSubjects((s) => [...s, res.data])
          setData(defaultFormData)
          setOpen(false)
        })
      }
  }

  const closeForm = () => {
    setOpen(false)
    setData(defaultFormData)
    setErrors(defaultFormData)
  }

  const deleteSubject = () => {
    if (initialSubject) {
      API.delete('subjects/' + initialSubject.id)
        .then(() => {
          setSubjects((s) => {
            const newSubjects = [...s]
            newSubjects.forEach((subject, index) => {
              if (subject.id === initialSubject.id) {
                newSubjects.splice(index, 1)
              }
            })
            return newSubjects
          })
          setData(defaultFormData)
          setOpen(false)
        })
        .catch(() => {
          enqueueSnackbar(
            'Das Fach "' +
              initialSubject.name +
              '" kann nicht gelöscht werden, da es in Verwendung ist.',
            snackbarOptionsError,
          )
        })
    }
  }

  useEffect(() => {
    if (!initialSubject) return

    setData((data) => ({
      ...data,
      color: initialSubject.color,
      name: initialSubject.name,
      shortForm: initialSubject.shortForm,
    }))
  }, [initialSubject, open])

  return (
    <Dialog open={open}>
      <DialogTitle>
        Fach {initialSubject ? 'bearbeiten' : 'hinzufügen'}
      </DialogTitle>
      <DialogContent>
        <Stack direction={{xs: "column", sm:"row"}} spacing={2} sx={{marginBottom: '20px'}}>
          <TextField
            helperText={errors.name}
            id="subjectName"
            label="Fachbezeichnung"
            variant="outlined"
            required={true}
            fullWidth={true}
            value={data.name}
            onChange={(event) =>
              setData((data) => ({ ...data, name: event.target.value }))
            }
          />
          <TextField
            helperText={errors.shortForm}
            id="shortForm"
            label="Abkürzung"
            variant="outlined"
            required={true}
            fullWidth={true}
            value={data.shortForm}
            onChange={(event) =>
              setData((data) => ({ ...data, shortForm: event.target.value }))
            }
          />
        </Stack>
        <SketchPicker
          color={data.color}
          onChange={(color) =>
            setData((data) => ({ ...data, color: color.hex }))
          }
        />
      </DialogContent>
      <DialogActions>
        {initialSubject && (
          <Button color="error" onClick={() => deleteSubject()}>
            Entfernen
          </Button>
        )}
        <Button onClick={closeForm}>Abbrechen</Button>
        <Button onClick={submitForm} variant="contained">
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SubjectDialog
