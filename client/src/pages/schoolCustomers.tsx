import AddCircleIcon from '@mui/icons-material/AddCircle'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
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
import { schoolCustomer } from '../types/user'
import styles from './gridList.module.scss'

const defaultFormData = {
  schoolName: '',
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

const SchoolCustomers: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [customers, setCustomers] = useState<schoolCustomer[]>([])
  const [data, setData] = useState(defaultFormData)

  const { API } = useAuth()

  //Get subjects, teachers from DB
  useEffect(() => {
    API.get(`users/schoolCustomer`).then((res) => setCustomers(res.data))
  }, [])

  console.log(customers)

  //creating rows out of the teachers
  const rows = customers.map((customer) => ({
    id: customer.id,
    customerName: customer.schoolName,
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
    setData(defaultFormData)
    setDialogOpen(true)
  }

  //TODO: validate filled fields
  const submitForm = () => {
    API.post(`users/schoolCustomer`, data).then((res) => {
      setCustomers((s) => [...s, res.data])
      setDialogOpen(false)
    })
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
          <TextField
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={submitForm}>Hinzufügen</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default SchoolCustomers
