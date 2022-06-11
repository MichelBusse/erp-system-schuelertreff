import AddCircleIcon from '@mui/icons-material/AddCircle'
import {
  Autocomplete,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
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
import TeacherDialog from '../components/TeacherDialog'
import subject from '../types/subject'
import { teacher } from '../types/user'
import styles from './gridList.module.scss'

//definition of the columns
const cols: GridColumns = [
  {
    field: 'teacherName',
    headerClassName: 'DataGridHead',
    headerName: 'Teacher',
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
    headerName: 'Subject',
    // width: 650,
    minWidth: 300,
    flex: 1,
    renderCell: (params) => (
      <Stack direction="row" spacing={2}>
        {params.value.map((subject: subject) => (
          <Chip
            key={subject.id}
            label={subject.name}
            sx={{ bgcolor: subject.color + 50 }}
          />
        ))}
      </Stack>
    ),
  },
]

const Teachers: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [teachers, setTeachers] = useState<teacher[]>([])

  const { API } = useAuth()

  //Get subjects, teachers from DB
  useEffect(() => {
    API.get(`users/teacher`).then((res) => setTeachers(res.data))
  }, [])

  //creating rows out of the teachers
  const rows = teachers.map((teacher) => ({
    id: teacher.id,
    teacherName: teacher.firstName + ' ' + teacher.lastName,
    subjectName: teacher.subjects,
  }))

  //space between rows
  const getRowSpacing = useCallback(
    (params: GridRowSpacingParams) => ({
      top: params.isFirstVisible ? 16 : 8,
      bottom: params.isLastVisible ? 8 : 8,
    }),
    [],
  )

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

      <TeacherDialog 
        open={open}
        setOpen={setOpen}
        setTeachers={setTeachers}
      />
    </div>
  )
}

export default Teachers
