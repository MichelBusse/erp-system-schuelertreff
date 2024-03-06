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
import { subjectFormValidation } from '../../../../core/utils/FormValidation'
import { SNACKBAR_OPTIONS_ERROR } from '../../../../core/res/Constants'
import { useAuth } from '../../../auth/components/AuthProvider'
import SubjectFormErrorTexts from '../../../../core/types/Form/SubjectFormErrorTexts'
import SubjectFormState from '../../../../core/types/Form/SubjectFormState'
import Subject from '../../../../core/types/Subject'
import {
  DEFAULT_SUBJECT_FORM_ERROR_TEXTS,
  DEFAULT_SUBJECT_FORM_STATE,
} from '../../../../core/res/Defaults'

type Props = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>
  initialSubject: Subject | null
}

const SubjectDialog: React.FC<Props> = ({
  open,
  setOpen,
  setSubjects,
  initialSubject,
}) => {
  const [data, setData] = useState<SubjectFormState>(DEFAULT_SUBJECT_FORM_STATE)
  const [errors, setErrors] = useState<SubjectFormErrorTexts>(
    DEFAULT_SUBJECT_FORM_ERROR_TEXTS,
  )
  const { enqueueSnackbar } = useSnackbar()

  const { API } = useAuth()

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
          setData(DEFAULT_SUBJECT_FORM_STATE)
          setErrors(DEFAULT_SUBJECT_FORM_ERROR_TEXTS)
          setOpen(false)
        })
      } else {
        API.post('subjects', data).then((res) => {
          setSubjects((s) => [...s, res.data])
          setData(DEFAULT_SUBJECT_FORM_STATE)
          setOpen(false)
        })
      }
    } else {
      setErrors(errorTexts)
      enqueueSnackbar('Überprüfe deine Eingaben', SNACKBAR_OPTIONS_ERROR)
    }
  }

  const closeForm = () => {
    setOpen(false)
    setData(DEFAULT_SUBJECT_FORM_STATE)
    setErrors(DEFAULT_SUBJECT_FORM_ERROR_TEXTS)
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
          setData(DEFAULT_SUBJECT_FORM_STATE)
          setOpen(false)
        })
        .catch(() => {
          enqueueSnackbar(
            'Das Fach "' +
              initialSubject.name +
              '" kann nicht gelöscht werden, da es in Verwendung ist.',
            SNACKBAR_OPTIONS_ERROR,
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
