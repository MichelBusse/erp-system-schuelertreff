import AddIcon from '@mui/icons-material/Add'
import { CircularProgress, Fab } from '@mui/material'
import { Box } from '@mui/system'
import dayjs, { Dayjs } from 'dayjs'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'
import { useAuth } from '../../../auth/components/AuthProvider'
import { snackbarOptionsError } from '../../../../core/res/consts'
import MultiCalendar from '../MultiCalendar'
import { DrawerParameters } from '../../pages/Timetable'
import { Contract } from '../../../../core/types/Contract'
import Lesson from '../../../../core/types/Lesson'
import Teacher from '../../../../core/types/Teacher'

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

  const [contracts, setContracts] = useState<Record<number, Contract[]>>({})
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [teachers, setTeachers] = useState<{ id: number; title: string }[]>([])

  const [loading, setLoading] = useState(true)
  const [renderLoading, setRenderLoading] = useState(0)

  useEffect(() => {
    API.get('users/teacher/employed').then((res) =>
      setTeachers(
        res.data
          .map((teacher: Teacher) => ({
            id: teacher.id,
            title: `${teacher.firstName} ${teacher.lastName}`,
          }))
          .concat({ id: -1, title: 'Ausstehend' }),
      ),
    )
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
        const contractsByTeacher: Record<number, Contract[]> = {}
        res.data.contracts
          .sort((a: Contract, b: Contract) => {
            return dayjs(a.startTime, 'HH:mm').diff(dayjs(b.startTime, 'HH:mm'))
          })
          .map((c: Contract) => {
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
