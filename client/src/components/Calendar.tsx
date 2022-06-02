import AddIcon from '@mui/icons-material/Add'
import { Fab, Paper } from '@mui/material'
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid'
import { Dayjs } from 'dayjs'

import { SideMenu } from '../pages/timetable'
import styles from './Calendar.module.scss'
import CalendarControl from './CalendarControl'

type Props = {
  date: Dayjs
  setOpen: (open: SideMenu) => void
  setDate: (date: Dayjs) => void
  openDialog: () => void
}

const rows: GridRowsProp = [
  { id: 1, teacher: 'Hello', mon: 'World' },
  { id: 2, teacher: 'DataGridPro', mon: 'is Awesome' },
  { id: 3, teacher: 'MUI', mon: 'is Amazing', wed: 'test' },
]

const Calendar: React.FC<Props> = ({ date, setOpen, setDate, openDialog }) => {
  const columns: GridColDef[] = [
    { field: 'teacher', headerName: '', width: 200, sortable: false },
    {
      field: 'mon',
      headerName: 'Montag\n' + date.day(1).format('DD.MM.YYYY'),
      width: 150,
      sortable: false,
    },
    {
      field: 'tue',
      headerName: 'Dienstag\n' + date.day(2).format('DD.MM.YYYY'),
      width: 150,
      sortable: false,
    },
    {
      field: 'wed',
      headerName: 'Mittwoch\n' + date.day(3).format('DD.MM.YYYY'),
      width: 150,
      sortable: false,
    },
    {
      field: 'thu',
      headerName: 'Donnerstag\n' + date.day(4).format('DD.MM.YYYY'),
      width: 150,
      sortable: false,
    },
    {
      field: 'fri',
      headerName: 'Freitag\n' + date.day(5).format('DD.MM.YYYY'),
      width: 150,
      sortable: false,
    },
  ]

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
