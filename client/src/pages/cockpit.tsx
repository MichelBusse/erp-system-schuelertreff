import { Box, useTheme } from '@mui/material'

import ApplicationMeetings from '../components/cockpit/ApplicationMeetings'
import CockpitLeaves from '../components/cockpit/CockpitLeaves'
import ContractsWithoutTeacher from '../components/cockpit/ContractsWithoutTeacher'
import DailyContracts from '../components/cockpit/DailyContracts'
import PendingContracts from '../components/cockpit/PendingContracts'
import SchoolStarts from '../components/cockpit/SchoolStarts'
import { LeaveState } from '../types/enums'

const Cockpit: React.FC = () => {
  const theme = useTheme()

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
      <DailyContracts />

      <ContractsWithoutTeacher />

      <PendingContracts />

      <SchoolStarts />

      <CockpitLeaves state={LeaveState.PENDING} />

      <CockpitLeaves state={LeaveState.ACCEPTED} />

      <ApplicationMeetings />
    </Box>
  )
}

export default Cockpit
