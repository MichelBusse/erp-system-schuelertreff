import { Box, SxProps, Typography, useTheme } from '@mui/material'
import { Theme } from '@mui/system'

import ApplicationMeetings from '../components/cockpit/ApplicationMeetings'
import CockpitLeaves from '../components/cockpit/CockpitLeaves'
import ContractsWithoutTeacher from '../components/cockpit/ContractsWithoutTeacher'
import DailyContracts from '../components/cockpit/DailyContracts'
import PendingContracts from '../components/cockpit/PendingContracts'
import SchoolStarts from '../components/cockpit/SchoolStarts'
import { LeaveState } from '../types/enums'

type Props = {
  listSx?: SxProps<Theme>
}

export type CockpitComponent = React.FC<Props>

const Cockpit: React.FC = () => {
  const theme = useTheme()
  const listSx = { height: '300px',  overflowY: 'scroll' }

  return (
    <Box
      sx={{
        p: 4,
        pb: 10,
        display: 'grid',
        gap: 2,
        [theme.breakpoints.down('md')]: {
          gridTemplateColumns: 'repeat(1, 1fr)',
        },
        [theme.breakpoints.up('md')]: {
          gridTemplateColumns: 'repeat(2, 1fr)',
        },
      }}
    >
      <DailyContracts listSx={listSx} />
      <SchoolStarts listSx={listSx} />
      <ContractsWithoutTeacher
        listSx={listSx}
      />
      <PendingContracts listSx={listSx} />
      <CockpitLeaves
        listSx={listSx}
        state={LeaveState.PENDING}
      />
      <CockpitLeaves
        listSx={listSx}
        state={LeaveState.ACCEPTED}
      />
      <ApplicationMeetings listSx={listSx}/>
    </Box>
  )
}

export default Cockpit
