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

import { useAuth } from '../components/AuthProvider'
import SchoolDialog from '../components/SchoolDialog'
import { dataGridLocaleText } from '../consts'
import { school } from '../types/user'
import styles from './gridList.module.scss'

import useMeasure from 'react-use-measure'

const Schools: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [customers, setCustomers] = useState<school[]>([])
  const navigate = useNavigate()
  const location = useLocation()

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
    API.get(`users/school`).then((res) => setCustomers(res.data))
  }, [location])

  useEffect(() => {
    if(small){
      setColumnVisibilityModel({
        customerName: true,
        customerEmail: true,
        customerPhone: false,
      })
    }else{
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
      minWidth: 160,
      flex: 1.5,
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
      filterOperators: getGridStringOperators().filter(
        (operator) => operator.value === 'contains',
      ),
      headerName: 'Email',
      minWidth: 160,
      flex: 1,
    },
    {
      field: 'customerPhone',
      headerClassName: 'DataGridHead',
      filterOperators: getGridStringOperators().filter(
        (operator) => operator.value === 'contains',
      ),
      headerName: 'Phone',
      flex: 1,
    },
  ]

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
          headerHeight={0}
          disableSelectionOnClick={true}
          onRowClick={onRowClick}
          localeText={dataGridLocaleText}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={(newModel) =>
            setColumnVisibilityModel(newModel)
          }
          ref={ref}
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

      <SchoolDialog open={open} setOpen={setOpen} setCustomers={setCustomers} />
    </div>
  )
}

export default Schools
