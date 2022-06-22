import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material'
import { useState } from 'react'

import AddTimes from '../components/AddTimes'
import { useAuth } from '../components/AuthProvider'
import { form } from '../types/form'
import subject from '../types/subject'
import { privateCustomer } from '../types/user'

type Props = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  setCustomers: React.Dispatch<React.SetStateAction<privateCustomer[]>>
}

const defaultFormData = {
  firstName: '',
  lastName: '',
  salutation: '',
  city: '',
  postalCode: '',
  street: '',
  email: '',
  phone: '',
  subjects: [] as subject[],
  fee: 0,
  timesAvailable: [],
}

const PrivateCustomerDialog: React.FC<Props> = ({
  open,
  setOpen,
  setCustomers,
}) => {
  const [data, setData] = useState<form>(defaultFormData)

  const { API } = useAuth()

  //TODO: validate filled fields
  const submitForm = () => {
    API.post(`users/privateCustomer`, {
      firstName: data.firstName,
      lastName: data.lastName,
      salutation: data.salutation,
      city: data.city,
      postalCode: data.postalCode,
      street: data.street,
      email: data.email,
      phone: data.phone,
      timesAvailable: data.timesAvailable.map((time) => ({
        dow: time.dow,
        start: time.start?.format('HH:mm'),
        end: time.end?.format('HH:mm'),
      })),
    }).then((res) => {
      setCustomers((s) => [...s, res.data])
      setOpen(false)
      setData(defaultFormData)
    })
  }

  const closeForm = () => {
    setOpen(false)
    setData(defaultFormData)
  }

  return (
    <Dialog open={open}>
      <DialogTitle>Privatkunden hinzufügen</DialogTitle>
      <DialogContent>
        <FormControl
          fullWidth
          sx={{ width: '25%', marginRight: '75%', marginTop: '15px' }}
        >
          <InputLabel id="SalutationLable">Anrede *</InputLabel>
          <Select
            id="Salutation"
            label="Anrede"
            value={data.salutation}
            onChange={(event) =>
              setData((data) => ({ ...data, salutation: event.target.value }))
            }
          >
            <MenuItem value="Herr">Herr</MenuItem>
            <MenuItem value="Frau">Frau</MenuItem>
            <MenuItem value="divers">divers</MenuItem>
          </Select>
        </FormControl>
        <TextField
          id="firstName"
          label="Vorname"
          variant="outlined"
          required={true}
          sx={{ margin: '10px', marginLeft: '0px', width: '45%' }}
          value={data.firstName}
          onChange={(event) =>
            setData((data) => ({ ...data, firstName: event.target.value }))
          }
        />
        <TextField
          id="lastName"
          label="Nachname"
          variant="outlined"
          required={true}
          sx={{ margin: '10px', width: '45%' }}
          value={data.lastName}
          onChange={(event) =>
            setData((data) => ({ ...data, lastName: event.target.value }))
          }
        />
        <TextField
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
        <AddTimes data={data} setData={setData} />
      </DialogContent>
      <DialogActions>
        <Button onClick={closeForm}>Abbrechen</Button>
        <Button onClick={submitForm}>Hinzufügen</Button>
      </DialogActions>
    </Dialog>
  )
}

export default PrivateCustomerDialog
