import { FolderDelete } from '@mui/icons-material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import { IconButton } from '@mui/material'
import {
  DataGrid,
  getGridStringOperators,
  GridColumns,
  GridColumnVisibilityModel,
  GridEventListener,
  GridRowSpacingParams,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from '@mui/x-data-grid'
import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useMeasure from 'react-use-measure'

import { useAuth } from '../components/AuthProvider'
import PrivateCustomerDialog from '../components/PrivateCustomerDialog'
import { dataGridLocaleText } from '../consts'
import { privateCustomer } from '../types/user'
import styles from './gridList.module.scss'

const PrivateCustomers: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [customers, setCustomers] = useState<privateCustomer[]>([])
  const navigate = useNavigate()
  const location = useLocation()
  const [deletedCustomersToggle, setDeletedCustomersToggle] =
    useState<boolean>(false)

  const { API } = useAuth()

  const [ref, bounds] = useMeasure()
  const small = bounds.width < 600

  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<GridColumnVisibilityModel>({
      customerName: true,
      customerEmail: true,
      customerPhone: true,
    })

  //Get subjects, teachers from DB
  useEffect(() => {
    if (!deletedCustomersToggle) {
      API.get(`users/privateCustomer`).then((res) => setCustomers(res.data))
    } else {
      API.get(`users/privateCustomer/deleted`).then((res) =>
        setCustomers(res.data),
      )
    }
  }, [location, deletedCustomersToggle])

  useEffect(() => {
    if (small) {
      setColumnVisibilityModel({
        customerName: true,
        customerEmail: true,
        customerPhone: false,
      })
    } else {
      setColumnVisibilityModel({
        customerName: true,
        customerEmail: true,
        customerPhone: true,
      })
    }
  }, [small])

  //definition of the columns
  const cols: GridColumns = [
    {
      field: 'customerName',
      headerClassName: 'DataGridHead',
      headerName: 'Name',
      flex: 1.5,
      minWidth: 160,
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
      flex: 1,
      minWidth: 160,
    },
    {
      field: 'customerPhone',
      headerClassName: 'DataGridHead',
      headerName: 'Phone',
      filterOperators: getGridStringOperators().filter(
        (operator) => operator.value === 'contains',
      ),
      flex: 1,
    },
  ]

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
  const onRowClick: GridEventListener<'rowClick'> = (params) => {
    navigate('' + params.id)
  }

  return (
    <div
      className={styles.wrapper + ' ' + styles.pageWrapper}
      style={{ minHeight: '100vh' }}
    >
      <div style={{ flexGrow: 1 }}>
        <DataGrid
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={(newModel) =>
            setColumnVisibilityModel(newModel)
          }
          ref={ref}
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
                <IconButton
                  color={deletedCustomersToggle ? 'secondary' : 'default'}
                  onClick={() => setDeletedCustomersToggle((data) => !data)}
                  sx={{ marginLeft: 'auto' }}
                >
                  <FolderDelete fontSize="large" />
                </IconButton>
                <IconButton onClick={() => setOpen(true)}>
                  <AddCircleIcon fontSize="large" color="primary" />
                </IconButton>
              </GridToolbarContainer>
            ),
          }}
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
