import AddIcon from '@mui/icons-material/Add'
import { CircularProgress, Fab } from '@mui/material'
import { Box } from '@mui/system'
import dayjs, { Dayjs } from 'dayjs'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'

import { snackbarOptionsError } from '../../consts'
import { DrawerParameters } from '../../pages/timetable'
import { contract } from '../../types/contract'
import { lesson } from '../../types/lesson'
import { teacher } from '../../types/user'
import { useAuth } from '../AuthProvider'
import MultiCalendar from './multiCalendar'

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
  const { enqueueSnackbar } = useSnackbar()

  const [contracts, setContracts] = useState<Record<number, contract[]>>({})
  const [lessons, setLessons] = useState<lesson[]>([])
  const [teachers, setTeachers] = useState<{id : number, title : string}[]>([])

  const [loading, setLoading] = useState(true)
  const [renderLoading, setRenderLoading] = useState(0)

  useEffect(() => {
    API.get('users/teacher/employed').then((res) => setTeachers(res.data.map((data: teacher) => 
      ({
        id: data.id,
        title: `${data.firstName} ${data.lastName}`
      })
    )))
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

  return (
    <>
      <Box
        sx={{
          height: '100%',
        }}
      >
        <MultiCalendar
          date={date}
          setDrawer={setDrawer}
          contracts={contracts}
          lessons={lessons}
          labels={teachers}
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
