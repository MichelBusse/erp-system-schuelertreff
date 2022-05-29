import 'dayjs/locale/de'

import AddIcon from '@mui/icons-material/Add'
import { Box, Fab } from '@mui/material'
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

const teachers = [
  { id: 1, name: 'Prof. der Magie Fugi' },
  { id: 2, name: 'Oberhaupt Michel' },
  { id: 3, name: 'Dr. Shishos Cönos' },
  { id: 4, name: 'Klimmzug Teubner' },
  { id: 5, name: 'Eggi Extrem' },
  { id: 6, name: 'Außendienstler Bley' },
  { id: 7, name: 'Angela Merkel' },
  { id: 8, name: 'Luis Günthersohn' },
  { id: 9, name: 'Litsch' },
  { id: 10, name: 'Paul Albert Hendinger' },
  { id: 11, name: 'Eggi Extrem' },
  { id: 12, name: 'Außendienstler Bley' },
  { id: 13, name: 'Angela Merkel' },
  { id: 14, name: 'Luis Günthersohn' },
  { id: 15, name: 'Litsch' },
  { id: 16, name: 'Paul Albert Hendinger' },
]

const Timetable: React.FC = () => {
  const [open, setOpen] = useState<SideMenu>({ state: false, info: 'Standard' })
  const [date, setDate] = useState(dayjs())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [render, setRender] = useState(0)

  return (
    <Box sx={{ p: 4 }}>
      <Calendar
        date={date}
        teachers={teachers}
        setOpen={setOpen}
        setDate={setDate}
      />

      <HiddenMenu open={open} setOpen={setOpen} />

      <Fab
        color="primary"
        aria-label="add"
        style={{
          position: 'absolute',
          bottom: 42,
          right: 42,
        }}
        onClick={() => {
          // dialog component is re-created each time
          // -> data will be fetched on button press
          setRender(render + 1)
          setDialogOpen(true)
        }}
      >
        <AddIcon />
      </Fab>

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
