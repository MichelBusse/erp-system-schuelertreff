import { Box, useTheme } from '@mui/material'
import DailyContracts from '../../components/DailyContracts'
import ContractsWithoutTeacher from '../../components/ContractsWithoutTeacher'
import PendingContracts from '../../components/PendingContracts'
import DashboardLeaves from '../../components/DashboardLeaves'
import ApplicationMeetings from '../../components/ApplicationMeetings'
import SchoolStarts from '../../components/SchoolStarts'
import LeaveState from '../../../../core/enums/LeaveState'

export default function Dashboard () {
  const theme = useTheme()
  const listSx = { height: '300px', overflowY: 'scroll' }

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
      <ContractsWithoutTeacher listSx={listSx} />
      <PendingContracts listSx={listSx} />
      <DashboardLeaves listSx={listSx} state={LeaveState.PENDING} />
      <DashboardLeaves listSx={listSx} state={LeaveState.ACCEPTED} />
      <ApplicationMeetings listSx={listSx} />
    </Box>
  )
}