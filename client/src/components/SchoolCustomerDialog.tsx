import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'
import { useState } from 'react'

import { useAuth } from '../components/AuthProvider'
import { schoolCustomer } from '../types/user'
import { formValidation } from '../utils/formValidation'

type Props = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  setCustomers: React.Dispatch<React.SetStateAction<schoolCustomer[]>>
}

const defaultFormData = {
  schoolName: '',
  city: '',
  postalCode: '',
  street: '',
  email: '',
  phone: '',
  timesAvailable: [],
}

const SchoolCustomerDialog: React.FC<Props> = ({
  open,
  setOpen,
  setCustomers,
}) => {
  const [data, setData] = useState(defaultFormData)
  const [errors, setErrors] = useState(defaultFormData)

  const { API } = useAuth()

  //TODO: validate filled fields
  const submitForm = () => {
    setErrors(formValidation('schoolCustomer', data))

    if (formValidation('schoolCustomer', data).validation)
      API.post(`users/schoolCustomer`, data).then((res) => {
        setCustomers((s) => [...s, res.data])
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
      <DialogTitle>Lehrkraft hinzufügen</DialogTitle>
      <DialogContent>
        <TextField
          helperText={errors.schoolName}
          id="schoolName"
          label="Schulname"
          variant="outlined"
          required={true}
          sx={{ margin: '10px', marginLeft: '0px', width: '94%' }}
          value={data.schoolName}
          onChange={(event) =>
            setData((data) => ({ ...data, schoolName: event.target.value }))
          }
        />
        <TextField
          helperText={errors.city}
          id="city"
          label="Stadt"
          variant="outlined"
          required={true}
          sx={{ margin: '10px', marginLeft: '0px', width: '60%' }}
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
          sx={{ margin: '10px', width: '30%' }}
          value={data.postalCode}
          onChange={(event) =>
            setData((data) => ({ ...data, postalCode: event.target.value }))
          }
        />
        <TextField
          helperText={errors.street}
          id="street"
          label="Straße"
          variant="outlined"
          required={true}
          sx={{ margin: '10px', marginLeft: '0px', width: '94%' }}
          value={data.street}
          onChange={(event) =>
            setData((data) => ({ ...data, street: event.target.value }))
          }
        />
        <TextField
          helperText={errors.email}
          id="email"
          label="E-Mail Adresse"
          variant="outlined"
          required={true}
          sx={{ margin: '10px', marginLeft: '0px', width: '60%' }}
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
          sx={{ margin: '10px', width: '30%' }}
          value={data.phone}
          onChange={(event) =>
            setData((data) => ({ ...data, phone: event.target.value }))
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

export default SchoolCustomerDialog
