import 'dayjs/locale/de'

import { Box } from '@mui/material'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { useState } from 'react'

import Calendar from '../components/Calendar'
import ContractDialog from '../components/ContractDialog'
import HiddenMenu from '../components/HiddenMenu'

dayjs.locale('de')
dayjs.extend(weekOfYear)

export type SideMenu = {
  state: boolean
  info: string
}

const Timetable: React.FC = () => {
  const [open, setOpen] = useState<SideMenu>({ state: false, info: 'Standard' })
  const [date, setDate] = useState(dayjs())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [render, setRender] = useState(0)

  return (
    <Box sx={{ p: 4, height: '100%' }}>
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
          setOpen={setOpen}
          setDate={setDate}
          openDialog={() => {
            // dialog component is re-created each time
            // -> data will be fetched on button press
            setRender(render + 1)
            setDialogOpen(true)
          }}
        />
      </Box>

      <HiddenMenu open={open} setOpen={setOpen} />

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
