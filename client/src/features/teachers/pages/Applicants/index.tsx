import styles from "../../../../core/styles/gridList.module.scss";

import AddCircleIcon from '@mui/icons-material/AddCircle'
import FolderDeleteIcon from '@mui/icons-material/FolderDelete'
import { Chip, IconButton, Stack } from '@mui/material'
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
import { PrevIdProps } from "../../../../App";
import { useAuth } from "../../../auth/components/AuthProvider";
import { degreeOperator, schoolTypesOperator, stateOperator, subjectOperator } from "../../../../core/utils/teacherFilterData";
import { dataGridLocaleText, teacherStateToString } from "../../../../core/res/consts";
import TeacherDialog from "../../components/TeacherDialog";
import Teacher from "../../../../core/types/Teacher";
import Subject from "../../../../core/types/Subject";
import TeacherState from "../../../../core/enums/TeacherState";

const Applicants: React.FC<PrevIdProps> = ({ prevId, setPrevId }) => {
  const [open, setOpen] = useState(false)
  const [renderDialog, setRenderDialog] = useState(0)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const navigate = useNavigate()
  const location = useLocation()
  const [deletedTeacherToggle, setDeletedTeacherToggle] =
    useState<boolean>(false)

  const { API } = useAuth()

  const [ref, bounds] = useMeasure()
  const small = bounds.width < 600

  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<GridColumnVisibilityModel>({
      teacherName: true,
      subjectName: true,
      state: true,
      city: false,
      degree: false,
    })

  useEffect(() => {
    if (small) {
      setColumnVisibilityModel({
        teacherName: true,
        subjectName: false,
        state: true,
        city: false,
        degree: false,
        schoolTypes: false,
      })
    } else {
      setColumnVisibilityModel({
        teacherName: true,
        subjectName: true,
        state: true,
        city: false,
        degree: false,
        schoolTypes: false,
      })
    }
  }, [small])

  //Get subjects, teachers from DB
  useEffect(() => {
    if (!deletedTeacherToggle) {
      API.get(`users/teacher/applied`).then((res) => {
        setTeachers(res.data)
      })
    } else {
      API.get(`users/teacher/applied/deleted`).then((res) => {
        setTeachers(res.data)
      })
    }
  }, [location, deletedTeacherToggle])

  //definition of the columns
  const cols: GridColumns = [
    {
      field: 'teacherName',
      headerClassName: 'DataGridHead',
      headerName: 'Name',
      width: 150,
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
      field: 'subjectName',
      headerClassName: 'DataGridHead',
      headerName: 'Fächer',
      // width: 650,
      //hide: true,
      flex: 1,
      filterOperators: [subjectOperator],
      renderCell: (params) => (
        <Stack direction="row" spacing={2}>
          {params.value?.map((subject: Subject) => (
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
      filterOperators: getGridStringOperators().filter(
        (operator) => operator.value === 'contains',
      ),
      renderCell: () => <></>,
    },
    {
      field: 'degree',
      headerClassName: 'DataGridHead',
      headerName: 'Abschluss',
      filterOperators: [degreeOperator],
      renderCell: () => <></>,
    },
    {
      field: 'state',
      headerClassName: 'DataGridHead',
      headerName: 'Status',
      minWidth: 150,
      flex: 0,
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
    {
      field: 'schoolTypes',
      headerClassName: 'DataGridHead',
      headerName: 'Schularten',
      // width: 650,
      // hide: true,
      flex: 1,
      filterOperators: [schoolTypesOperator],
      renderCell: () => <></>,
    },
  ]

  //creating rows out of the teachers
  const rows = teachers.map((teacher) => ({
    id: teacher.id,
    teacherName: teacher.firstName + ' ' + teacher.lastName,
    subjectName: teacher.subjects,
    city: teacher.city,
    degree: teacher.degree,
    state: teacher.state,
    schoolTypes: teacher.teacherSchoolTypes,
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
    navigate('/applicants/' + params.id)
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
          getRowClassName={(params) =>
            params.row.id === prevId ? `lastVisited` : ''
          }
          components={{
            Toolbar: () => (
              <GridToolbarContainer
                className={styles.customGridToolbarContainer}
              >
                <GridToolbarFilterButton />
                <IconButton
                  color={deletedTeacherToggle ? 'secondary' : 'default'}
                  onClick={() => setDeletedTeacherToggle((data) => !data)}
                  sx={{ marginLeft: 'auto' }}
                >
                  <FolderDeleteIcon fontSize="large" />
                </IconButton>
                <IconButton
                  onClick={() => {
                    setRenderDialog((r) => r + 1)
                    setOpen(true)
                  }}
                >
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

      <TeacherDialog
        key={renderDialog}
        open={open}
        closeDialog={() => setOpen(false)}
        setTeachers={setTeachers}
        teacherType={'applied'}
      />
    </div>
  )
}

export default Applicants
