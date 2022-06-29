import 'dayjs/locale/de'

import { Box, Button, Drawer, Stack, Typography } from '@mui/material'
import { GridCellParams } from '@mui/x-data-grid'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { useEffect, useState } from 'react'

import { useAuth } from '../components/AuthProvider'
import Calendar from '../components/Calendar'
import ContractDialog from '../components/ContractDialog'
import LessonOverview from '../components/LessonOverview'
import TeacherCalendar from '../components/TeacherCalendar'
import { contract } from '../types/contract'
import { lesson } from '../types/lesson'
import { teacher } from '../types/user'

dayjs.locale('de')
dayjs.extend(weekOfYear)

export type DrawerParameters = {
  open: boolean
  params: GridCellParams | null
  lessons: lesson[]
}

const Timetable: React.FC = () => {
  const { API, hasRole } = useAuth()

  const [drawer, setDrawer] = useState<DrawerParameters>({
    open: false,
    params: null,
    lessons: [],
  })
  const [date, setDate] = useState(dayjs().day(1))
  const [open, setOpen] = useState(false)

  const [render, setRender] = useState(0)

  const [refreshCalendar, setRefreshCalendar] = useState(0)
  const [teachers, setTeachers] = useState<teacher[]>([])

  useEffect(() => {
    API.get('users/teacher').then((res) => setTeachers(res.data))
  }, [refreshCalendar])

  return (
    <Box
      sx={{
        p: 4,
        height: '100%',
      }}
    >
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {hasRole('admin') ? (
          <Calendar
            date={date}
            setDrawer={setDrawer}
            setDate={setDate}
            openDialog={() => {
              // dialog component is re-created each time
              // -> data will be fetched on button press
              setRender(render + 1)
              setOpen(true)
            }}
            refresh={refreshCalendar}
            teachers={teachers}
          />
        ) : null}

        {hasRole('teacher') ? (
          <TeacherCalendar
            date={date}
            setDrawer={setDrawer}
            setDate={setDate}
          />
        ) : null}
      </Box>

      <Drawer
        open={drawer.open}
        onClose={() => setDrawer((d) => ({ ...d, open: false }))}
        anchor={'right'}
        variant="persistent"
      >
        <Stack
          direction={'column'}
          minWidth={300}
          sx={{ padding: '1em', height: '100%' }}
        >
          {drawer.params && (
            <>
              <span>
                {drawer.params.colDef.headerName?.replace('\n', ' / ')}
              </span>
              <Typography variant="h5" mb={3}>
                {drawer.params.row.teacher}
              </Typography>
              <Stack spacing={2}>
                {(drawer.params.value as contract[])?.map((c) => {
                  let existingLesson = null
                  console.log(drawer.lessons)
                  for (const lesson of drawer.lessons) {
                    if (
                      lesson.contract.id === c.id &&
                      dayjs(lesson.date).format('DD/MM/YYYY') ===
                        dayjs(
                          drawer.params?.colDef.headerName,
                          'dddd\nDD.MM.YYYY',
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
                      date={dayjs(
                        drawer.params?.colDef.headerName,
                        'dddd\nDD.MM.YYYY',
                      )}
                    />
                  )
                })}
              </Stack>
            </>
          )}

          <Button
            variant="text"
            size="medium"
            onClick={() =>
              setDrawer({ open: false, params: null, lessons: [] })
            }
            sx={{ marginTop: 'auto' }}
          >
            schließen
          </Button>
        </Stack>
      </Drawer>

      {!!render && (
        <>
          <ContractDialog
            key={render}
            open={open}
            setOpen={setOpen}
            onSuccess={() => setRefreshCalendar((r) => r + 1)}
            teachers={teachers}
          />
        </>
      )}
    </Box>
  )
}

export default Timetable
