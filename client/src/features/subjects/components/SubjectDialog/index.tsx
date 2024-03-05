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
import { defaultSubjectFormErrorTexts, subjectFormValidation } from '../../../../core/utils/formValidation'
import { subjectForm, subjectFormErrorTexts } from '../../../../core/types/form'
import { defaultSubjectFormData, snackbarOptionsError } from '../../../../core/res/consts'
import { useAuth } from '../../../auth/components/AuthProvider'
import subject from '../../../../core/types/subject'

type Props = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  setSubjects: React.Dispatch<React.SetStateAction<subject[]>>
  initialSubject: subject | null
}

const SubjectDialog: React.FC<Props> = ({
  open,
  setOpen,
  setSubjects,
  initialSubject,
}) => {
  const [data, setData] = useState<subjectForm>(defaultSubjectFormData)
  const [errors, setErrors] = useState<subjectFormErrorTexts>(
    defaultSubjectFormErrorTexts,
  )
  const { enqueueSnackbar } = useSnackbar()

  const { API } = useAuth()

  //TODO: validate filled fields
  const submitForm = () => {
    const errorTexts = subjectFormValidation(data)

    if (errorTexts.valid) {
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
          setData(defaultSubjectFormData)
          setErrors(defaultSubjectFormErrorTexts)
          setOpen(false)
        })
      } else {
        API.post('subjects', data).then((res) => {
          setSubjects((s) => [...s, res.data])
          setData(defaultSubjectFormData)
          setOpen(false)
        })
      }
    } else {
      setErrors(errorTexts)
      enqueueSnackbar('Überprüfe deine Eingaben', snackbarOptionsError)
    }
  }

  const closeForm = () => {
    setOpen(false)
    setData(defaultSubjectFormData)
    setErrors(defaultSubjectFormErrorTexts)
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
          setData(defaultSubjectFormData)
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
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ marginBottom: '20px', paddingTop: '10px' }}
        >
          <TextField
            helperText={errors.name}
            error={errors.name !== ''}
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
            error={errors.shortForm !== ''}
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
