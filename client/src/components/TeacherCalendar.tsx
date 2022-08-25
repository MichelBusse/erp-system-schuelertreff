import PriorityHighIcon from '@mui/icons-material/PriorityHigh'
import { Fab, Paper } from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'

import { DrawerParameters } from '../pages/timetable'
import { contract } from '../types/contract'
import { lesson } from '../types/lesson'
import AcceptContractsDialog from './AcceptContractsDialog'
import { useAuth } from './AuthProvider'
import Calendar from './Calendar'
import CalendarControl from './CalendarControl'
import styles from './TeacherCalendar.module.scss'

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

  return (
    <>
      <Paper className={styles.wrapper}>
        <CalendarControl date={date} setDate={setDate} />

        <Calendar
          date={date}
          contracts={contracts}
          lessons={lessons}
          setDrawer={setDrawer}
        />

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
