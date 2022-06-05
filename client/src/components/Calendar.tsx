import AddIcon from '@mui/icons-material/Add'
import { Fab, Paper } from '@mui/material'
import { Box } from '@mui/system'
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid'
import dayjs, { Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'

import { SideMenu } from '../pages/timetable'
import subject from '../types/subject'
import { customer, teacher } from '../types/user'
import { useAuth } from './AuthProvider'
import styles from './Calendar.module.scss'
import CalendarControl from './CalendarControl'

type Props = {
  date: Dayjs
  setOpen: (open: SideMenu) => void
  setDate: (date: Dayjs) => void
  openDialog: () => void
}

type contract = {
  id: number
  startTime: string
  endTime: string
  startDate: string
  endDate: string
  interval: 1
  subject: subject
  customers: customer[]
  teacher: number
}

const Calendar: React.FC<Props> = ({ date, setOpen, setDate, openDialog }) => {
  const { API } = useAuth()
  const [teachers, setTeachers] = useState<teacher[]>([])
  const [contracts, setContracts] = useState<Record<number, contract[]>>([])

  useEffect(() => {
    API.get('users/teacher').then((res) => setTeachers(res.data))
  }, [])

  useEffect(() => {
    API.get('lessons/week', {
      params: {
        of: date.format('YYYY-MM-DD'),
      },
    }).then((res) => {
      let contractsByTeacher: Record<number, contract[]> = {}

      res.data.map((c: contract) => {
        contractsByTeacher[c.teacher] = (
          contractsByTeacher[c.teacher] ?? []
        ).concat(c)
      })

      setContracts(contractsByTeacher)
    })
  }, [date])

  const getCellValue: GridColDef['valueGetter'] = ({ id, colDef: { field } }) =>
    contracts[id as number]?.filter(
      (c) => dayjs(c.startDate).day().toString() === field,
    )

  const columns: GridColDef[] = [
    { field: 'teacher', headerName: '', width: 200, sortable: false },

    ...[1, 2, 3, 4, 5].map(
      (n): GridColDef => ({
        field: n.toString(),
        headerName: date.day(n).format('dddd\nDD.MM.YYYY'),
        width: 150,
        sortable: false,
        valueGetter: getCellValue,
        renderCell: (params) => (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
            }}
          >
            {(params.value as contract[])?.map((c) => (
              <Box
                key={c.id}
                sx={{
                  backgroundColor: c.subject.color + '95',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: `0 0 5px ${c.subject.color} inset`,
                }}
              >
                {c.subject.shortForm}
              </Box>
            ))}
          </Box>
        ),
      }),
    ),
  ]

  const rows: GridRowsProp = teachers.map((t) => ({
    id: t.id,
    teacher: `${t.firstName} ${t.lastName}`,
  }))

  return (
    <Paper
      className={styles.wrapper}
      sx={{ width: columns.reduce((p, c) => p + (c.width ?? 100), 0) }}
    >
      <CalendarControl date={date} setDate={setDate} />

      <DataGrid
        style={{
          flexGrow: 1,
          border: 'none',
        }}
        rows={rows}
        columns={columns}
        disableColumnMenu={true}
        disableSelectionOnClick={true}
        onCellClick={(params) => {
          if (params.colDef.field === 'teacher')
            setOpen({ state: true, info: `${params.id}` })
        }}
      />

      <Fab
        color="primary"
        aria-label="add"
        style={{
          position: 'absolute',
          bottom: 64,
          right: 16,
        }}
        onClick={openDialog}
      >
        <AddIcon />
      </Fab>
    </Paper>
  )
}

export default Calendar
