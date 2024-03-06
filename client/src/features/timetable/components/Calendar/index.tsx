import { Box } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import dayjs, { Dayjs } from 'dayjs'

import styles from './styles.module.scss'
import { Contract } from '../../../../core/types/Contract'
import Lesson from '../../../../core/types/Lesson'
import TimetableDrawerData from '../../../../core/types/TimetableDrawerData'

type Props = {
  date: Dayjs
  setDrawer: (params: TimetableDrawerData) => void
  contracts: Contract[]
  lessons: Lesson[]
}

const Calendar: React.FC<Props> = ({ date, setDrawer, contracts, lessons }) => {
  const rowHeight = 777
  const startTimeAM = 7
  const numberOfHours = 14
  const hourHeight = rowHeight / numberOfHours

  const getCellValue: GridColDef['valueGetter'] = ({ colDef: { field } }) =>
    contracts?.filter((c) => dayjs(c.startDate).day().toString() === field)

  const renderCell: GridColDef['renderCell'] = (params) => (
    <Box
      sx={{
        cursor: (params.value ?? []).length > 0 ? 'pointer' : 'normal',
      }}
    >
      {(params.value as Contract[])?.map((c) => {
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
              backgroundColor: c.blocked ? '#cccccc' : c.subject.color + '70',
              height: hourHeight * hours,
              width: 180,
              position: 'absolute',
              top: hourHeight * begin,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: c.blocked
                ? `0 0 2px #bbbbbb inset`
                : c.teacher
                ? `0 0 2px ${c.subject.color} inset`
                : undefined,
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
        headerAlign: 'left',
        headerName: date.day(n).format('YYYY-MM-DD'),
        renderHeader: () => (
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.2' }}>
            <span>
              <b>{date.day(n).format('dddd')}</b>
            </span>
            <br />
            <span>{date.day(n).format('DD.MM.YYYY')}</span>
          </div>
        ),
        width: 180,
        sortable: false,
        valueGetter: getCellValue,
        renderCell,
      }),
    ),
  ]

  return (
    <Box
      className={styles.wrapper}
      style={{
        width: columns.reduce((p, c) => p + (c.width ?? 100), 0),
        maxWidth: '100%',
        height: '100%',
        overflowX: 'scroll',
      }}
    >
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
            (params.value ?? []).length > 0 &&
            setDrawer
          ) {
            setDrawer({ open: true, params: params, lessons: lessons })
          }
        }}
      />
    </Box>
  )
}

export default Calendar
