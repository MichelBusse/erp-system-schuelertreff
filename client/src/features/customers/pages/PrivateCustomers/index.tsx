import styles from "../../../../core/styles/gridList.module.scss";
import { FolderDelete, IosShare as IosShareIcon } from '@mui/icons-material'
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
import { useSnackbar } from 'notistack'
import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useMeasure from 'react-use-measure'
import { useAuth } from '../../../auth/components/AuthProvider'
import PrivateCustomerDialog from '../../components/PrivateCustomerDialog'
import PrivateCustomer from "../../../../core/types/PrivateCustomer";
import { DATA_GRID_LOCALE_TEXT, SNACKBAR_OPTIONS, SNACKBAR_OPTIONS_ERROR } from "../../../../core/res/Constants";
import PreviousIdPageProps from "../../../../core/types/PreviousIdPageProps";

const PrivateCustomers: React.FC<PreviousIdPageProps> = ({ prevId, setPrevId }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { API } = useAuth()
  const { enqueueSnackbar } = useSnackbar()

  const [open, setOpen] = useState(false)
  const [customers, setCustomers] = useState<PrivateCustomer[]>([])
  const [deletedCustomersToggle, setDeletedCustomersToggle] =
    useState<boolean>(false)

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
    setPrevId && setPrevId(Number(params.id))
    navigate('' + params.id)
  }

  // click event
  const copyEmailsToClipboard = () => {
    navigator.clipboard
      .writeText(
        customers
          .map((s) => `${s.firstName} ${s.lastName} <${s.email}>`)
          .join('\r\n'),
      )
      .then(() =>
        enqueueSnackbar(
          'Email-Adressen wurden in die Zwischenablage kopiert',
          SNACKBAR_OPTIONS,
        ),
      )
      .catch(() =>
        enqueueSnackbar('Ein Fehler ist aufgetreten', SNACKBAR_OPTIONS_ERROR),
      )
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
          localeText={DATA_GRID_LOCALE_TEXT}
          headerHeight={0}
          disableSelectionOnClick={true}
          onRowClick={onRowClick}
          getRowClassName={(params) =>
            params.row.id === prevId ? `lastVisited` : ''
          }
          components={{
            Toolbar: () => (
              <GridToolbarContainer
                className={styles.customGridToolbarContainer}
              >
                <GridToolbarFilterButton sx={{ marginRight: 'auto' }} />
                {!deletedCustomersToggle && (
                  <IconButton onClick={copyEmailsToClipboard}>
                    <IosShareIcon fontSize="large" />
                  </IconButton>
                )}
                <IconButton
                  color={deletedCustomersToggle ? 'secondary' : 'default'}
                  onClick={() => setDeletedCustomersToggle((data) => !data)}
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
