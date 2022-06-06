import 'dayjs/locale/de'

import { Box } from '@mui/material'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { ReactElement, useState } from 'react'

import Calendar from '../components/Calendar'
import ContractDialog from '../components/ContractDialog'
import HiddenMenu from '../components/HiddenMenu'

dayjs.locale('de')
dayjs.extend(weekOfYear)

export type SideMenu = {
  open: boolean
  content: ReactElement
}

const Timetable: React.FC = () => {
  const [drawer, setDrawer] = useState<SideMenu>({
    open: false,
    content: <></>,
  })
  const [date, setDate] = useState(dayjs().day(1))
  const [dialogOpen, setDialogOpen] = useState(false)
  const [render, setRender] = useState(0)

  return (
    <Box
      sx={{
        p: 4,
        height: '100%',
        // marginRight: drawer.open ? '240px' : 0,
        // transition: theme.transitions.create('margin', {
        //   easing: theme.transitions.easing.easeInOut,
        //   duration:
        //     theme.transitions.duration[
        //       drawer.open ? 'leavingScreen' : 'enteringScreen'
        //     ],
        // }),
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
        <Calendar
          date={date}
          setDrawer={setDrawer}
          setDate={setDate}
          openDialog={() => {
            // dialog component is re-created each time
            // -> data will be fetched on button press
            setRender(render + 1)
            setDialogOpen(true)
          }}
        />
      </Box>

      <HiddenMenu
        state={drawer}
        close={() => setDrawer((d) => ({ ...d, open: false }))}
      />

      {!!render && (
        <ContractDialog
          key={render}
          open={dialogOpen}
          setOpen={setDialogOpen}
        />
      )}
    </Box>
  )
}

export default Timetable
