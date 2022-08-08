import { Fab, Paper } from '@mui/material'
import { Box } from '@mui/system'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import dayjs, { Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'

import { DrawerParameters } from '../pages/timetable'
import { contract } from '../types/contract'
import { lesson } from '../types/lesson'
import AcceptContractsDialog from './AcceptContractsDialog'
import { useAuth } from './AuthProvider'
import CalendarControl from './CalendarControl'
import styles from './TeacherCalendar.module.scss'
import PriorityHighIcon from '@mui/icons-material/PriorityHigh'

type Props = {
  date: Dayjs
  setDrawer: (params: DrawerParameters) => void
  setDate: (date: Dayjs) => void
}

const TeacherCalendar: React.FC<Props> = ({ date, setDrawer, setDate }) => {
  const { API } = useAuth()
  const [contracts, setContracts] = useState<contract[]>([])
  const [pendingContracts, setPendingContracts] = useState<contract[]>([])
  const [lessons, setLessons] = useState<lesson[]>([])
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [refresh, setRefresh] = useState<number>(0)

  const rowHeight = 777
  const startTimeAM = 7
  const numberOfHours = 14
  const hourHeight = rowHeight / numberOfHours

  useEffect(() => {
    API.get('lessons/myLessons', {
      params: {
        of: date.format('YYYY-MM-DD'),
      },
    }).then((res) => {
      setContracts(
        res.data.contracts.sort((a: contract, b: contract) => {
          return dayjs(a.startTime, 'HH:mm').isAfter(
            dayjs(b.startTime, 'HH:mm'),
          )
            ? 1
            : -1
        }),
      )
      setPendingContracts(res.data.pendingContracts)
      setLessons(res.data.lessons)
    })
  }, [date, refresh])

  const getCellValue: GridColDef['valueGetter'] = ({ colDef: { field } }) =>
    contracts?.filter((c) => dayjs(c.startDate).day().toString() === field)

  const renderCell: GridColDef['renderCell'] = (params) => (
    <Box
      sx={{
        cursor: (params.value ?? []).length > 0 ? 'pointer' : 'normal',
      }}
    >
      {(params.value as contract[])?.map((c) => {
        const hours =
          (Date.parse('01 Jan 1970 ' + c.endTime) -
            Date.parse('01 Jan 1970 ' + c.startTime)) /
          3600000
        const begin =
          (Date.parse('01 Jan 1970 ' + c.startTime) -
            Date.parse('01 Jan 1970 0' + startTimeAM + ':00:00')) / //upper Time!!!
          3600000
        return (
          <Box
            key={c.id}
            sx={{
              backgroundColor: c.subject.color + '70',
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
          {[...Array(numberOfHours)].map((_, i) => (
            <div
              key={i}
              className="timeCell"
              style={{
                color: '#7b878880',
                fontWeight: 'bold',
                height: hourHeight,
                width: '50px',
                borderTopStyle: 'solid',
                borderTopColor: '#7b878860',
                textAlign: 'right',
                padding: '3px',
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

  return (
    <>
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
          rows={[{ id: 0 }]}
          columns={columns}
          disableColumnMenu={true}
          disableSelectionOnClick={true}
          onCellClick={(params) => {
            if (
              params.colDef.field !== 'teacher' &&
              (params.value ?? []).length > 0
            ) {
              setDrawer({ open: true, params: params, lessons: lessons })
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
            display: pendingContracts.length > 0 ? 'block' : 'none'
          }}
          onClick={() => setDialogOpen(true)}
        >
          <PriorityHighIcon />
        </Fab>
      </Paper>
      <AcceptContractsDialog
        contracts={pendingContracts}
        open={dialogOpen}
        setOpen={setDialogOpen}
        refresh={() => setRefresh((re) => ++re)}
      />
    </>
  )
}

export default TeacherCalendar
