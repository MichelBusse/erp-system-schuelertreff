import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'
import { useState } from 'react'
import { SketchPicker } from 'react-color'

import { useAuth } from '../components/AuthProvider'
import subject from '../types/subject'
import { formValidation } from './FormValidation'

type Props = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  setSubjects: React.Dispatch<React.SetStateAction<subject[]>>
}

const defaultFormData = {
  color: '#FF0000',
  name: '',
  shortForm: '',
}

const SubjectDialog: React.FC<Props> = ({ open, setOpen, setSubjects }) => {
  const [data, setData] = useState(defaultFormData)
  const [errors, setErrors] = useState(defaultFormData)

  const { API } = useAuth()

  //TODO: validate filled fields
  const submitForm = () => {
    setErrors(formValidation('subject', data))

    if (formValidation('subject', data).validation)
      API.post('subjects', data).then((res) => {
        setSubjects((s) => [...s, res.data])
        setData(defaultFormData)
        setOpen(false)
      })
  }

  const closeForm = () => {
    setOpen(false)
    setData(defaultFormData)
    setErrors(defaultFormData)
  }

  return (
    <Dialog open={open}>
      <DialogTitle>Fach hinzufügen</DialogTitle>
      <DialogContent>
        <TextField
          helperText={errors.name}
          id="subjectName"
          label="Fachbezeichnung"
          variant="outlined"
          required={true}
          sx={{ margin: '10px', marginLeft: '0px' }}
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
          sx={{ margin: '10px' }}
          value={data.shortForm}
          onChange={(event) =>
            setData((data) => ({ ...data, shortForm: event.target.value }))
          }
        />
        <SketchPicker
          color={data.color}
          onChange={(color) =>
            setData((data) => ({ ...data, color: color.hex }))
          }
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={closeForm}>Abbrechen</Button>
        <Button onClick={submitForm}>Hinzufügen</Button>
      </DialogActions>
    </Dialog>
  )
}

export default SubjectDialog
