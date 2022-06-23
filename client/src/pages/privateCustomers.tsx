import AddCircleIcon from '@mui/icons-material/AddCircle'
import { IconButton } from '@mui/material'
import {
  DataGrid,
  getGridStringOperators,
  GridColumns,
  GridEventListener,
  GridRowSpacingParams,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from '@mui/x-data-grid'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../components/AuthProvider'
import PrivateCustomerDialog from '../components/PrivateCustomerDialog'
import { dataGridLocaleText } from '../consts'
import { privateCustomer } from '../types/user'
import styles from './gridList.module.scss'

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
    filterOperators: getGridStringOperators().filter(
      (operator) => operator.value === 'contains',
    ),
    minWidth: 300,
    flex: 1,
  },
  {
    field: 'customerPhone',
    headerClassName: 'DataGridHead',
    headerName: 'Phone',
    filterOperators: getGridStringOperators().filter(
      (operator) => operator.value === 'contains',
    ),
    minWidth: 300,
    flex: 1,
  },
]

const PrivateCustomers: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [customers, setCustomers] = useState<privateCustomer[]>([])
  const navigate = useNavigate();

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

  //Row click event
  const onRowClick: GridEventListener<'rowClick'> = (
    params
  ) => {
    navigate("" + params.id)
  }

  return (
    <div className={styles.wrapper}>
      <div style={{ flexGrow: 1 }}>
        <DataGrid
          localeText={dataGridLocaleText}
          headerHeight={0}
          disableSelectionOnClick={true}
          onRowClick={onRowClick}
          components={{
            Toolbar: () => (
              <GridToolbarContainer
                className={styles.customGridToolbarContainer}
              >
                <GridToolbarFilterButton />
                <IconButton onClick={() => setOpen(true)}>
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
      <PrivateCustomerDialog
        open={open}
        setOpen={setOpen}
        setCustomers={setCustomers}
      />
    </div>
  )
}

export default PrivateCustomers
