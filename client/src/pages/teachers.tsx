import AddCircleIcon from '@mui/icons-material/AddCircle'
import {
  Autocomplete,
  Box,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  NativeSelect,
  Stack,
  TextField,
} from '@mui/material'
import {
  DataGrid,
  getGridStringOperators,
  GridCellParams,
  GridColumns,
  GridEventListener,
  GridFilterInputValueProps,
  GridFilterItem,
  GridFilterOperator,
  GridRowSpacingParams,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from '@mui/x-data-grid'
import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../components/AuthProvider'
import TeacherDialog from '../components/TeacherDialog'
import { dataGridLocaleText, teacherStateToString } from '../consts'
import { Degree, TeacherState } from '../types/enums'
import subject from '../types/subject'
import { teacher } from '../types/user'
import styles from './gridList.module.scss'

//definition of subject filter input
const SubjectsFilterInputValue: React.FC<GridFilterInputValueProps> = ({
  item,
  applyValue,
}) => {
  const { API } = useAuth()
  const [subjects, setSubjects] = useState<subject[]>([])

  useEffect(() => {
    API.get(`subjects`).then((res) => setSubjects(res.data))
  }, [])

  return (
    <Box
      sx={{
        display: 'inline-flex',
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        pl: '20px',
      }}
    >
      <Autocomplete
        id="subjects"
        options={subjects}
        getOptionLabel={(option) => option.name}
        value={item.value}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            label="Fächer *"
            sx={{ minWidth: '150px' }}
          />
        )}
        onChange={(event, newValue) => {
          applyValue({ ...item, value: newValue })
        }}
      />
    </Box>
  )
}

const DegreeFilterInputValue: React.FC<GridFilterInputValueProps> = ({
  item,
  applyValue,
}) => (
  <FormControl fullWidth>
    <InputLabel variant="standard" htmlFor="degree-select">
      Höchster Abschluss
    </InputLabel>
    <NativeSelect
      inputProps={{
        name: 'degree',
        id: 'degree-select',
      }}
      defaultValue={Degree.NOINFO}
      required
      onChange={(event) => {
        applyValue({ ...item, value: event.target.value })
      }}
    >
      <option value={Degree.NOINFO}>Keine Angabe</option>
      <option value={Degree.HIGHSCHOOL}>Abitur</option>
      <option value={Degree.BACHELOR}>Bachelor</option>
      <option value={Degree.MASTER}>Master</option>
    </NativeSelect>
  </FormControl>
)

const StateFilterInputValue: React.FC<GridFilterInputValueProps> = ({
  item,
  applyValue,
}) => (
  <FormControl fullWidth>
    <InputLabel variant="standard" htmlFor="state-select">
      Status
    </InputLabel>
    <NativeSelect
      inputProps={{
        name: 'state',
        id: 'state-select',
      }}
      defaultValue={''}
      required
      onChange={(event) => {
        applyValue({ ...item, value: event.target.value })
      }}
    >
      <option value={''}></option>
      {Object.values(TeacherState).map((state) => (
        <option key={state} value={state}>
          {teacherStateToString[state]}
        </option>
      ))}
    </NativeSelect>
  </FormControl>
)

//definition of filter operators
const subjectOperator: GridFilterOperator = {
  label: 'enthalten',
  value: 'includes',
  getApplyFilterFn: (filterItem: GridFilterItem) => {
    if (
      !filterItem.columnField ||
      !filterItem.value ||
      !filterItem.operatorValue
    ) {
      return null
    }

    return (params: GridCellParams): boolean => {
      return params.value
        .map((sub: subject) => sub.name)
        .includes(filterItem.value.name)
    }
  },
  InputComponent: SubjectsFilterInputValue,
  InputComponentProps: { type: 'string' },
}

const degreeOperator: GridFilterOperator = {
  label: 'mindestens',
  value: 'mininum',
  getApplyFilterFn: (filterItem: GridFilterItem) => {
    if (
      !filterItem.columnField ||
      !filterItem.value ||
      !filterItem.operatorValue
    ) {
      return null
    }

    return (params: GridCellParams): boolean => {
      switch (filterItem.value) {
        case Degree.NOINFO:
          return true
        case Degree.HIGHSCHOOL:
          return (
            params.value === Degree.HIGHSCHOOL ||
            params.value === Degree.BACHELOR ||
            params.value === Degree.MASTER
          )
        case Degree.BACHELOR:
          return (
            params.value === Degree.BACHELOR || params.value === Degree.MASTER
          )
        case Degree.MASTER:
          return params.value === Degree.MASTER
        default:
          return false
      }
    }
  },
  InputComponent: DegreeFilterInputValue,
  InputComponentProps: { type: 'string' },
}

const stateOperator: GridFilterOperator = {
  label: 'ist',
  value: 'is',
  getApplyFilterFn: (filterItem: GridFilterItem) => {
    if (
      !filterItem.columnField ||
      !filterItem.value ||
      !filterItem.operatorValue
    ) {
      return null
    }

    return (params: GridCellParams) => params.value === filterItem.value
  },
  InputComponent: StateFilterInputValue,
  InputComponentProps: { type: 'string' },
}

//definition of the columns
const cols: GridColumns = [
  {
    field: 'teacherName',
    headerClassName: 'DataGridHead',
    headerName: 'Name',
    width: 200,
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
    field: 'subjectName',
    headerClassName: 'DataGridHead',
    headerName: 'Fächer',
    // width: 650,
    minWidth: 300,
    flex: 1,
    filterOperators: [subjectOperator],
    renderCell: (params) => (
      <Stack direction="row" spacing={2}>
        {params.value?.map((subject: subject) => (
          <Chip
            key={subject.id}
            label={subject.name}
            sx={{ bgcolor: subject.color + 50 }}
          />
        ))}
      </Stack>
    ),
  },
  {
    field: 'city',
    headerClassName: 'DataGridHead',
    headerName: 'Stadt',
    hide: true,
    filterOperators: getGridStringOperators().filter(
      (operator) => operator.value === 'contains',
    ),
    renderCell: () => <></>,
  },
  {
    field: 'degree',
    headerClassName: 'DataGridHead',
    headerName: 'Abschluss',
    hide: true,
    filterOperators: [degreeOperator],
    renderCell: () => <></>,
  },
  {
    field: 'state',
    headerClassName: 'DataGridHead',
    headerName: 'Status',
    minWidth: 150,
    filterOperators: [stateOperator],
    renderCell: (params) => (
      <div
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          paddingLeft: 15,
        }}
      >
        {teacherStateToString[params.value as TeacherState]}
      </div>
    ),
  },
]

const Teachers: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [teachers, setTeachers] = useState<teacher[]>([])
  const navigate = useNavigate()
  const location = useLocation()

  const { API } = useAuth()

  //Get subjects, teachers from DB
  useEffect(() => {
    API.get(`users/teacher`).then((res) => {
      setTeachers(res.data)
    })
  }, [location])

  //creating rows out of the teachers
  const rows = teachers.map((teacher) => ({
    id: teacher.id,
    teacherName: teacher.firstName + ' ' + teacher.lastName,
    subjectName: teacher.subjects,
    city: teacher.city,
    degree: teacher.degree,
    state: teacher.state,
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
    <div className={styles.wrapper} style={{ minHeight: '100vh' }}>
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

      <TeacherDialog open={open} setOpen={setOpen} setTeachers={setTeachers} />
    </div>
  )
}

export default Teachers
