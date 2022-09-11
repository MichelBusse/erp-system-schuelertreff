import PriorityHighIcon from '@mui/icons-material/PriorityHigh'
import { Box, CircularProgress, Fab } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import dayjs, { Dayjs } from 'dayjs'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'

import { snackbarOptionsError } from '../../consts'
import { DrawerParameters } from '../../pages/timetable'
import { contract } from '../../types/contract'
import { lesson } from '../../types/lesson'
import AcceptContractsDialog from '../AcceptContractsDialog'
import { useAuth } from '../AuthProvider'
import styles from './TeacherCalendar.module.scss'

type Props = {
  date: Dayjs
  setDrawer: (params: DrawerParameters) => void
  refresh?: number
  setRefresh?: React.Dispatch<React.SetStateAction<number>>
}

const TeacherCalendar: React.FC<Props> = ({
  date,
  setDrawer,
  refresh,
  setRefresh,
}) => {
  const { API } = useAuth()
  const { enqueueSnackbar } = useSnackbar()

  const [contracts, setContracts] = useState<contract[]>([])
  const [pendingContracts, setPendingContracts] = useState<contract[]>([])
  const [lessons, setLessons] = useState<lesson[]>([])
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)

  const [loading, setLoading] = useState(true)
  const [renderLoading, setRenderLoading] = useState(0)

  useEffect(() => {
    const ongoingRequest = new AbortController()

    setRenderLoading((r) => r + 1)
    setLoading(true)
    setContracts([])

    API.get('lessons/myLessons', {
      signal: ongoingRequest.signal,
      params: {
        of: date.format('YYYY-MM-DD'),
      },
    })
      .then((res) => {
        setContracts(
          res.data.contracts.sort((a: contract, b: contract) => {
            return dayjs(a.startTime, 'HH:mm').diff(dayjs(b.startTime, 'HH:mm'))
          }),
        )
        setPendingContracts(res.data.pendingContracts)
        setLessons(res.data.lessons)
        setLoading(false)
      })
      .catch((err) => {
        if (err?.code !== 'ERR_CANCELED') {
          console.error(err)
          enqueueSnackbar('Ein Fehler ist aufgetreten', snackbarOptionsError)
        }
      })

    // abort request
    return () => ongoingRequest.abort()
  }, [date, refresh])

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
    <>
      <Box
        className={styles.wrapper}
        sx={{
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

        <CircularProgress
          key={renderLoading}
          size={26}
          sx={{
            pointerEvents: 'none',
            position: 'absolute',
            top: 8,
            left: 8,
            opacity: loading ? 1 : 0,
            transition: 'opacity .25s ease',
          }}
        />
      </Box>

      <Fab
        color="primary"
        aria-label="add"
        style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          display: pendingContracts.length > 0 ? 'block' : 'none',
        }}
        onClick={() => setDialogOpen(true)}
      >
        <PriorityHighIcon />
      </Fab>

      <AcceptContractsDialog
        contracts={pendingContracts}
        open={dialogOpen}
        setOpen={setDialogOpen}
        refresh={() => setRefresh && setRefresh((re) => ++re)}
      />
    </>
  )
}

export default TeacherCalendar
