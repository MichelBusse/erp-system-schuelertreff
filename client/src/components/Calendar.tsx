import AddIcon from '@mui/icons-material/Add'
import { Button, Fab, Paper, Stack, Typography } from '@mui/material'
import { Box } from '@mui/system'
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridRowsProp,
} from '@mui/x-data-grid'
import dayjs, { Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'

import { SideMenu } from '../pages/timetable'
import { contract } from '../types/contract'
import { teacher } from '../types/user'
import { useAuth } from './AuthProvider'
import styles from './Calendar.module.scss'
import CalendarControl from './CalendarControl'

type Props = {
  date: Dayjs
  setDrawer: (open: SideMenu) => void
  setDate: (date: Dayjs) => void
  openDialog: () => void
  openContractDetailsDialog: (id: number) => void
  refresh?: number
  teachers: teacher[]
}

const Calendar: React.FC<Props> = ({
  date,
  setDrawer,
  setDate,
  openDialog,
  openContractDetailsDialog,
  refresh,
  teachers,
}) => {
  const { API } = useAuth()

  const [contracts, setContracts] = useState<Record<number, contract[]>>([])

  useEffect(() => {
    API.get('lessons/week', {
      params: {
        of: date.format('YYYY-MM-DD'),
      },
    }).then((res) => {
      const contractsByTeacher: Record<number, contract[]> = {}

      res.data.map((c: contract) => {
        contractsByTeacher[c.teacher] = (
          contractsByTeacher[c.teacher] ?? []
        ).concat(c)
      })

      setContracts(contractsByTeacher)
    })
  }, [date, refresh])

  const getCellValue: GridColDef['valueGetter'] = ({ id, colDef: { field } }) =>
    contracts[id as number]?.filter(
      (c) => dayjs(c.startDate).day().toString() === field,
    )

  const renderCell: GridColDef['renderCell'] = (params) => (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        cursor: (params.value ?? []).length > 0 ? 'pointer' : 'normal',
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
            boxShadow: `0 0 2px ${c.subject.color} inset`,
          }}
        >
          {c.subject.shortForm}
        </Box>
      ))}
    </Box>
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
        renderCell,
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
          if (
            params.colDef.field !== 'teacher' &&
            (params.value ?? []).length > 0
          ) {
            setDrawer({
              open: true,
              content: drawerContent(params, openContractDetailsDialog),
            })
          }
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

const drawerContent = (
  params: GridCellParams,
  openContractDetailsDialog: (id: number) => void,
) => (
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

export default Calendar
