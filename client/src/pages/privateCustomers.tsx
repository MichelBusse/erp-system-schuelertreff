import AddCircleIcon from '@mui/icons-material/AddCircle'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material'
import {
  DataGrid,
  getGridStringOperators,
  GridColumns,
  GridRowSpacingParams,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from '@mui/x-data-grid'
import { useCallback, useEffect, useState } from 'react'

import { useAuth } from '../components/AuthProvider'
import privateCustomer from '../types/privateCustomer'
import styles from './gridList.module.scss'

const testEmail = (email: string) => /.+@.+\.[A-Za-z]+$/.test(email)

const defaultFormData = {
  firstName: '',
  lastName: '',
  salutation: '',
  city: '',
  postalCode: '',
  street: '',
  email: '',
  phone: '',
}

//definition of the columns
const cols: GridColumns = [
  {
    field: 'customerName',
    headerClassName: 'DataGridHead',
    headerName: 'Name',
    minWidth: 300,
    flex: 1,
    filterOperators: getGridStringOperators().filter(
      (operator) => operator.value === 'contains',
    ),
    renderCell: (params) => (
      <div
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          paddingLeft: 15,
        }}
      >
        {params.value}
      </div>
    ),
  },
  {
    field: 'customerEmail',
    headerClassName: 'DataGridHead',
    headerName: 'Email',
    minWidth: 300,
    flex: 1,
  },
  {
    field: 'customerPhone',
    headerClassName: 'DataGridHead',
    headerName: 'Phone',
    minWidth: 300,
    flex: 1,
  },
]

const PrivateCustomers: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [customers, setCustomers] = useState<privateCustomer[]>([])
  const [data, setData] = useState(defaultFormData)
  const [errors, setErrors] = useState(defaultFormData)

  const { API } = useAuth()

  //Get subjects, teachers from DB
  useEffect(() => {
    API.get(`users/privateCustomer`).then((res) => setCustomers(res.data))
  }, [])

  //creating rows out of the teachers
  const rows = customers.map((customer) => ({
    id: customer.id,
    customerName: customer.firstName + ' ' + customer.lastName,
    customerEmail: customer.email,
    customerPhone: customer.phone,
  }))

  //space between rows
  const getRowSpacing = useCallback(
    (params: GridRowSpacingParams) => ({
      top: params.isFirstVisible ? 16 : 8,
      bottom: params.isLastVisible ? 8 : 8,
    }),
    [],
  )

  const openDialog = () => {
    setErrors(defaultFormData)
    setData(defaultFormData)
    setDialogOpen(true)
  }

  //TODO: validate filled fields
  const formValidation = () =>
    setErrors({
      firstName: data.firstName ? '' : 'Vorname fehlt!',
      lastName: data.lastName ? '' : 'Nachname fehlt!',
      salutation: data.salutation ? '' : 'Anrede fehlt!',
      city: data.city ? '' : 'Stadt fehlt!',
      postalCode: data.postalCode.length == 5 ? '' : 'genau 5 Stellen!',
      street: data.street ? '' : 'Straße fehlt!',
      email: testEmail(data.email) ? '' : 'E-Mail ist nicht korrekt!',
      phone: data.phone.length > 9 ? '' : 'mind. 10 Stellen!',
    })

  const submitForm = () => {
    if (
      data.firstName &&
      data.lastName &&
      data.salutation &&
      data.city &&
      data.postalCode.length == 5 &&
      data.street &&
      testEmail(data.email) &&
      data.phone.length > 9
    ) {
      API.post(`users/privateCustomer`, data).then((res) => {
        setCustomers((s) => [...s, res.data])
        setDialogOpen(false)
      })
    }
  }

  return (
    <div className={styles.wrapper}>
      <div style={{ flexGrow: 1 }}>
        <DataGrid
          headerHeight={0}
          disableSelectionOnClick={true}
          components={{
            Toolbar: () => (
              <GridToolbarContainer
                className={styles.customGridToolbarContainer}
              >
                <GridToolbarFilterButton />
                <IconButton onClick={openDialog}>
                  <AddCircleIcon fontSize="large" color="primary" />
                </IconButton>
              </GridToolbarContainer>
            ),
          }}
          hideFooter={true}
          rows={rows}
          columns={cols}
          getRowSpacing={getRowSpacing}
        />
      </div>

      <Dialog open={dialogOpen}>
        <DialogTitle>Lehrkraft hinzufügen</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Geben Sie die Daten der Lehrkraft ein. Pflichtfelder sind mit *
            markiert.
          </DialogContentText>
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
            <FormHelperText>{errors.salutation}</FormHelperText>
          </FormControl>
          <TextField
            helperText={errors.firstName}
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
            helperText={errors.lastName}
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
          <Button onClick={() => setDialogOpen(false)}>Abbrechen</Button>
          <Button
            onClick={() => {
              formValidation()
              submitForm()
            }}
          >
            Hinzufügen
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default PrivateCustomers
