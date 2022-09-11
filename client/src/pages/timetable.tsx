import 'dayjs/locale/de'

import { Close as CloseIcon } from '@mui/icons-material'
import {
  Box,
  Drawer,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { GridCellParams } from '@mui/x-data-grid'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '../components/AuthProvider'
import AdminCalendar from '../components/calendar/AdminCalendar'
import TeacherCalendar from '../components/calendar/TeacherCalendar'
import CalendarControl from '../components/CalendarControl'
import ContractDialog from '../components/ContractDialog'
import LessonOverview from '../components/LessonOverview'
import { contract } from '../types/contract'
import { lesson } from '../types/lesson'
import { Role } from '../types/user'

dayjs.locale('de')
dayjs.extend(weekOfYear)

export type DrawerParameters = {
  open: boolean
  params: GridCellParams | null
  lessons: lesson[]
}

const Timetable: React.FC = () => {
  const { hasRole } = useAuth()
  const { initialDate } = useParams()
  const theme = useTheme()
  const navigate = useNavigate()

  const [drawer, setDrawer] = useState<DrawerParameters>({
    open: false,
    params: null,
    lessons: [],
  })
  const [date, setDate] = useState(
    initialDate && dayjs(initialDate, 'YYYY-MM-DD').isValid()
      ? dayjs(initialDate, 'YYYY-MM-DD').day(1)
      : dayjs().day(1),
  )
  const [refreshCalendar, setRefreshCalendar] = useState(0)

  // ContractDialog
  const [open, setOpen] = useState(false)
  const [render, setRender] = useState(0)

  useEffect(
    () =>
      navigate('/timetable/' + date.format('YYYY-MM-DD'), { replace: true }),
    [date],
  )

  return (
    <Box
      sx={{
        p: 4,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        [theme.breakpoints.down('lg')]: {
          p: 0,
        },
        [theme.breakpoints.down('md')]: {
          paddingBottom: '50px',
        },
      }}
    >
      <Paper
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          maxWidth: '100%',
          height: '100%',
          borderRadius: '25px !important',
          [theme.breakpoints.down('lg')]: {
            borderRadius: '0px !important',
          },
        }}
      >
        <CalendarControl date={date} setDate={setDate} />

        {hasRole(Role.ADMIN) ? (
          <AdminCalendar
            date={date}
            setDrawer={setDrawer}
            openDialog={() => {
              // dialog component is re-created each time
              // -> data will be fetched on button press
              setRender(render + 1)
              setOpen(true)
            }}
            refresh={refreshCalendar}
          />
        ) : null}

        {hasRole(Role.TEACHER) ? (
          <TeacherCalendar
            date={date}
            setDrawer={setDrawer}
            refresh={refreshCalendar}
            setRefresh={setRefreshCalendar}
          />
        ) : null}
      </Paper>

      <Drawer
        open={drawer.open}
        onClose={() => setDrawer((d) => ({ ...d, open: false }))}
        anchor={'right'}
        variant="persistent"
      >
        <Stack
          direction={'column'}
          spacing={2}
          sx={{ p: 2, minWidth: '300px' }}
        >
          <IconButton
            aria-label="close"
            sx={{ alignSelf: 'start', m: -1 }}
            onClick={() =>
              setDrawer({ open: false, params: null, lessons: [] })
            }
          >
            <CloseIcon />
          </IconButton>

          {drawer.params && (
            <>
              <Box sx={{ mb: 1 }}>
                <Typography>{drawer.params.colDef.headerName}</Typography>
                <Typography variant="h5">
                  {drawer.params.row.teacher}
                </Typography>
              </Box>

              {(drawer.params.value as contract[])?.map((c) => {
                let existingLesson = null
                for (const lesson of drawer.lessons) {
                  if (
                    lesson.contract.id === c.id &&
                    dayjs(lesson.date).format('DD/MM/YYYY') ===
                      dayjs(
                        drawer.params?.colDef.headerName,
                        'YYYY-MM-DD',
                      ).format('DD/MM/YYYY')
                  ) {
                    existingLesson = lesson
                    break
                  }
                }
                return (
                  <LessonOverview
                    key={c.id}
                    contract={c}
                    existingLesson={existingLesson}
                    refresh={() => {
                      setRefreshCalendar((n) => ++n)
                    }}
                    calendarDate={date}
                    date={dayjs(drawer.params?.colDef.headerName, 'YYYY-MM-DD')}
                  />
                )
              })}
            </>
          )}
        </Stack>
      </Drawer>

      {!!render && (
        <>
          <ContractDialog
            key={render}
            open={open}
            setOpen={setOpen}
            onSuccess={() => setRefreshCalendar((r) => r + 1)}
          />
        </>
      )}
    </Box>
  )
}

export default Timetable
