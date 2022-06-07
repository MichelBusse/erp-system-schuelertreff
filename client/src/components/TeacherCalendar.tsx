import { Paper, Stack, Typography } from '@mui/material'
import { Box } from '@mui/system'
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridRowsProp,
} from '@mui/x-data-grid'
import dayjs, { Dayjs } from 'dayjs'
import { useEffect, useRef, useState } from 'react'

import { SideMenu } from '../pages/timetable'
import subject from '../types/subject'
import { customer, teacher } from '../types/user'
import { useAuth } from './AuthProvider'
import styles from './TeacherCalendar.module.scss'
import CalendarControl from './CalendarControl'

type Props = {
  date: Dayjs
  setDrawer: (open: SideMenu) => void
  setDate: (date: Dayjs) => void
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

const TeacherCalendar: React.FC<Props> = ({ date, setDrawer, setDate }) => {
  const { API } = useAuth()
  const [contracts, setContracts] = useState<contract[]>([])
  const [teacher, setTeacher] = useState<teacher>({
    id: 0,
    firstName: '',
    lastName: '',
  } as teacher)

  const rowHeight = 692
  const startTimeAM = 7 
  const numberOfHours = 14
  const hourHeight = rowHeight / numberOfHours

  useEffect(() => {
    API.get('contracts/myContracts', {
      params: {
        of: date.format('YYYY-MM-DD'),
      },
    }).then((res) => {
      setContracts(res.data)
    })
  }, [date])

  useEffect(() => {
    API.get('users/me').then((res) => {
      setTeacher(res.data)
    })
  }, [])

  const getCellValue: GridColDef['valueGetter'] = ({ colDef: { field } }) =>
    contracts?.filter((c) => dayjs(c.startDate).day().toString() === field)

  const renderCell: GridColDef['renderCell'] = (params) => (
    <Box
      sx={{
        cursor: (params.value ?? []).length > 0 ? 'pointer' : 'normal',
      }}
    >
      {(params.value as contract[])?.map((c) => {
        let hours =
          (Date.parse('01 Jan 1970 ' + c.endTime) -
            Date.parse('01 Jan 1970 ' + c.startTime)) /
          3600000
        let begin =
          (Date.parse('01 Jan 1970 ' + c.startTime) -
            Date.parse('01 Jan 1970 0'+ startTimeAM +':00:00')) / //upper Time!!!
          3600000
        return (
          <Box
            key={c.id}
            sx={{
              backgroundColor: c.subject.color + '95',
              height: hourHeight * hours,
              width: 180,
              position: 'absolute',
              top: hourHeight * begin,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: `0 0 2px ${c.subject.color} inset`,
            }}
          >
            <div>{c.subject.name}</div>
            <div>
              {c.startTime.substring(0, 5) + ' - ' + c.endTime.substring(0, 5)}
            </div>
          </Box>
        )
      })}
    </Box>
  )

  const columns: GridColDef[] = [
    {
      field: 'times',
      headerName: '',
      width: 50,
      sortable: false,
      renderCell: () => (
        <div>
          {[...Array(numberOfHours)].map((e, i) => (
            <div
              key={i}
              className="timeCell"
              style={{
                height: '50px',
                width: '50px',
                borderTopStyle: 'solid',
                borderTopColor: '#7b878850',
              }}
            >
              {startTimeAM + i} Uhr
            </div>
          ))}
        </div>
      ),
    },
    ...[1, 2, 3, 4, 5].map(
      (n): GridColDef => ({
        field: n.toString(),
        headerName: date.day(n).format('dddd\nDD.MM.YYYY'),
        width: 180,
        sortable: false,
        valueGetter: getCellValue,
        renderCell,
      }),
    ),
  ]

  const rows: GridRowsProp = [
    {
      id: teacher.id,
    },
  ]

  return (
    <Paper
      className={styles.wrapper}
      sx={{ width: columns.reduce((p, c) => p + (c.width ?? 100), 0) }}
    >
      <CalendarControl date={date} setDate={setDate} />

      <DataGrid
        getRowHeight={() => rowHeight}
        hideFooter={true}
        style={{
          flexGrow: 1,
          border: 'none',
        }}
        rows={rows}
        columns={columns}
        disableColumnMenu={true}
        disableSelectionOnClick={true}
        onCellClick={(params) => {
          if (
            params.colDef.field !== 'teacher' &&
            (params.value ?? []).length > 0
          ) {
            setDrawer({ open: true, content: drawerContent(params) })
          }
        }}
      />
    </Paper>
  )
}

const drawerContent = (params: GridCellParams) => (
  <>
    <span>{params.colDef.headerName?.replace('\n', ' / ')}</span>
    <Typography variant="h5" mb={3}>
      {params.row.teacher}
    </Typography>
    <Stack spacing={2}>
      {(params.value as contract[])?.map((c) => (
        <Stack
          key={c.id}
          spacing={0.5}
          sx={{
            backgroundColor: c.subject.color + 50,
            p: 1,
            borderRadius: 2,
          }}
        >
          <span>
            {c.startTime.substring(0, 5) + ' - ' + c.endTime.substring(0, 5)}
          </span>
          <span>{c.subject.name}</span>
          <span>Kunden:</span>
          <ul className={styles.list}>
            {c.customers.map((s) => (
              <li key={s.id}>
                {s.role === 'schoolCustomer'
                  ? s.schoolName
                  : s.firstName + ' ' + s.lastName}
              </li>
            ))}
          </ul>
        </Stack>
      ))}
    </Stack>
  </>
)

export default TeacherCalendar
