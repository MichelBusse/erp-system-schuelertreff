import AddIcon from '@mui/icons-material/Add'
import { CircularProgress, Fab, useTheme } from '@mui/material'
import { Box } from '@mui/system'
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid'
import dayjs, { Dayjs } from 'dayjs'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'

import { snackbarOptionsError } from '../../consts'
import { DrawerParameters } from '../../pages/timetable'
import { contract } from '../../types/contract'
import { lesson } from '../../types/lesson'
import { teacher } from '../../types/user'
import { useAuth } from '../AuthProvider'
import styles from './AdminCalendar.module.scss'

type Props = {
  date: Dayjs
  setDrawer: (params: DrawerParameters) => void
  openDialog: () => void
  refresh?: number
}

const AdminCalendar: React.FC<Props> = ({
  date,
  setDrawer,
  openDialog,
  refresh,
}) => {
  const { API } = useAuth()
  const theme = useTheme()
  const { enqueueSnackbar } = useSnackbar()

  const [contracts, setContracts] = useState<Record<number, contract[]>>({})
  const [lessons, setLessons] = useState<lesson[]>([])
  const [teachers, setTeachers] = useState<teacher[]>([])

  const [loading, setLoading] = useState(true)
  const [renderLoading, setRenderLoading] = useState(0)

  useEffect(() => {
    API.get('users/teacher/employed').then((res) => setTeachers(res.data))
  }, [refresh])

  useEffect(() => {
    const ongoingRequest = new AbortController()

    setRenderLoading((r) => r + 1)
    setLoading(true)
    setContracts({})

    API.get('lessons/week', {
      signal: ongoingRequest.signal,
      params: {
        of: date.format('YYYY-MM-DD'),
      },
    })
      .then((res) => {
        const contractsByTeacher: Record<number, contract[]> = {}

        res.data.contracts
          .sort((a: contract, b: contract) => {
            return dayjs(a.startTime, 'HH:mm').diff(dayjs(b.startTime, 'HH:mm'))
          })
          .map((c: contract) => {
            if (c.teacher) {
              contractsByTeacher[c.teacher.id] = (
                contractsByTeacher[c.teacher.id] ?? []
              ).concat(c)
            } else {
              contractsByTeacher[-1] = (contractsByTeacher[-1] ?? []).concat(c)
            }
          })

        setContracts(contractsByTeacher)
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
      {(params.value as contract[])?.map((c) => {
        return (
          <Box
            key={c.id}
            sx={{
              backgroundColor: c.subject.color + '70',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: c.teacher
                ? `0 0 2px ${c.subject.color} inset`
                : undefined,
              borderWidth: !c.teacher ? '2px' : undefined,
              borderStyle: !c.teacher ? 'solid' : undefined,
              borderColor: !c.teacher ? theme.palette.error.main : undefined,
            }}
          >
            {c.subject.shortForm}
          </Box>
        )
      })}
    </Box>
  )

  const columns: GridColDef[] = [
    { field: 'teacher', headerName: '', width: 200, sortable: false },

    ...[1, 2, 3, 4, 5].map(
      (n): GridColDef => ({
        field: n.toString(),
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
        width: 150,
        sortable: false,
        valueGetter: getCellValue,
        renderCell,
      }),
    ),
  ]

  const rows: GridRowsProp = teachers
    .map((t) => ({
      id: t.id,
      teacher: `${t.firstName} ${t.lastName}`,
    }))
    .concat([{ id: -1, teacher: `Ausstehend` }])

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
                params: params,
                lessons: lessons,
              })
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
          bottom: 64,
          right: 16,
        }}
        onClick={openDialog}
      >
        <AddIcon />
      </Fab>
    </>
  )
}

export default AdminCalendar
