import 'dayjs/locale/de'

import { Box } from '@mui/material'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { ReactElement, useEffect, useState } from 'react'

import { useAuth } from '../components/AuthProvider'
import Calendar from '../components/Calendar'
import ContractDialog from '../components/ContractDialog'
import ContractEditDialog from '../components/ContractEditDialog'
import HiddenMenu from '../components/HiddenMenu'
import TeacherCalendar from '../components/TeacherCalendar'
import { teacher } from '../types/user'

dayjs.locale('de')
dayjs.extend(weekOfYear)

export type SideMenu = {
  open: boolean
  content: ReactElement
}

const Timetable: React.FC = () => {
  const { API, hasRole } = useAuth()

  const [drawer, setDrawer] = useState<SideMenu>({
    open: false,
    content: <></>,
  })
  const [date, setDate] = useState(dayjs().day(1))
  const [open, setOpen] = useState(false)
  const [contractDetailsDialog, setContractDetailsDialog] = useState<{
    open: boolean
    id: number
  }>({ open: false, id: -1 })

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
            openContractDetailsDialog={(id) => {
              setContractDetailsDialog({ id: id, open: true })
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

      <HiddenMenu
        state={drawer}
        close={() => setDrawer((d) => ({ ...d, open: false }))}
      />

      <ContractEditDialog
        dialogInfo={contractDetailsDialog}
        setDialogInfo={(open: boolean, id: number) =>
          setContractDetailsDialog({ open: open, id: id })
        }
        onSuccess={() => {
          setDrawer({ open: false, content: <></> })
          setRefreshCalendar((r) => r + 1)
        }}
      />
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
