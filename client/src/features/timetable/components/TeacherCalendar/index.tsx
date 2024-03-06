import PriorityHighIcon from '@mui/icons-material/PriorityHigh'
import { Box, CircularProgress, Fab } from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'

import AcceptContractsDialog from '../AcceptContractsDialog'
import Calendar from '../Calendar'
import { SNACKBAR_OPTIONS_ERROR } from '../../../../core/res/Constants'
import { useAuth } from '../../../auth/components/AuthProvider'
import { Contract } from '../../../../core/types/Contract'
import Lesson from '../../../../core/types/Lesson'
import TimetableDrawerData from '../../../../core/types/TimetableDrawerData'

type Props = {
  date: Dayjs
  setDrawer: (params: TimetableDrawerData) => void
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

  const [contracts, setContracts] = useState<Contract[]>([])
  const [pendingContracts, setPendingContracts] = useState<Contract[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
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
          res.data.contracts.sort((a: Contract, b: Contract) => {
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
          enqueueSnackbar('Ein Fehler ist aufgetreten', SNACKBAR_OPTIONS_ERROR)
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
        <Calendar
          date={date}
          setDrawer={setDrawer}
          contracts={contracts}
          lessons={lessons}
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
