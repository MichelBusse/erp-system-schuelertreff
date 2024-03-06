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
import { useAuth } from "../../../auth/components/AuthProvider";
import { DATA_GRID_LOCALE_TEXT, SNACKBAR_OPTIONS, SNACKBAR_OPTIONS_ERROR } from "../../../../core/res/Constants";
import SchoolDialog from "../../components/SchoolDialog";
import School from "../../../../core/types/School";
import { SchoolTypeFilterOperator } from "../../../../core/res/Filters";
import PreviousIdPageProps from "../../../../core/types/PreviousIdPageProps";

const Schools: React.FC<PreviousIdPageProps> = ({ prevId, setPrevId }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { API } = useAuth()
  const { enqueueSnackbar } = useSnackbar()

  const [open, setOpen] = useState(false)
  const [customers, setCustomers] = useState<School[]>([])
  const [deletedSchoolsToggle, setDeletedSchoolsToggle] =
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
    if (!deletedSchoolsToggle) {
      API.get(`users/school`).then((res) => setCustomers(res.data))
    } else {
      API.get(`users/school/deleted`).then((res) => setCustomers(res.data))
    }
  }, [location, deletedSchoolsToggle])

  useEffect(() => {
    if (small) {
      setColumnVisibilityModel({
        customerName: true,
        customerEmail: true,
        customerPhone: false,
        city: false,
        schoolTypes: false,
      })
    } else {
      setColumnVisibilityModel({
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        city: false,
        schoolTypes: false,
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
      filterable: false,
      headerName: 'Email',
      minWidth: 160,
      flex: 1,
    },
    {
      field: 'customerPhone',
      headerClassName: 'DataGridHead',
      filterable: false,
      headerName: 'Phone',
      flex: 1,
    },
    {
      field: 'city',
      headerClassName: 'DataGridHead',
      headerName: 'Stadt',
      filterOperators: getGridStringOperators().filter(
        (operator) => operator.value === 'contains',
      ),
      renderCell: () => <></>,
    },
    {
      field: 'schoolTypes',
      headerClassName: 'DataGridHead',
      headerName: 'Schulart',
      filterOperators: [SchoolTypeFilterOperator],
      renderCell: () => <></>,
    },
  ]

  //creating rows out of the teachers
  const rows = customers.map((customer) => ({
    id: customer.id,
    customerName: customer.schoolName,
    customerEmail: customer.email,
    customerPhone: customer.phone,
    city: customer.city,
    schoolTypes: customer.schoolTypes,
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
        customers.map((s) => `${s.schoolName} <${s.email}>`).join('\r\n'),
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
          headerHeight={0}
          disableSelectionOnClick={true}
          onRowClick={onRowClick}
          localeText={DATA_GRID_LOCALE_TEXT}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={(newModel) =>
            setColumnVisibilityModel(newModel)
          }
          getRowClassName={(params) =>
            params.row.id === prevId ? `lastVisited` : ''
          }
          ref={ref}
          components={{
            Toolbar: () => (
              <GridToolbarContainer
                className={styles.customGridToolbarContainer}
              >
                <GridToolbarFilterButton sx={{ marginRight: 'auto' }} />
                {!deletedSchoolsToggle && (
                  <IconButton onClick={copyEmailsToClipboard}>
                    <IosShareIcon fontSize="large" />
                  </IconButton>
                )}
                <IconButton
                  color={deletedSchoolsToggle ? 'secondary' : 'default'}
                  onClick={() => setDeletedSchoolsToggle((data) => !data)}
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

      <SchoolDialog open={open} setOpen={setOpen} setCustomers={setCustomers} />
    </div>
  )
}

export default Schools
