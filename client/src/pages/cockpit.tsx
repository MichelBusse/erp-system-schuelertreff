import { Box, Stack } from '@mui/material'

import CockpitLeaves from '../components/cockpit/CockpitLeaves'
import PendingContracts from '../components/cockpit/PendingContracts'
import SchoolStarts from '../components/cockpit/SchoolStarts'
import { LeaveState } from '../types/enums'

const Cockpit: React.FC = () => {
  return (
    <Box sx={{ p: 4, pb: 10 }}>
      <Stack direction={'column'} spacing={2} width="100%">
        <Stack
          direction={{
            xs: 'column',
            sm: 'column',
            md: 'column',
            lg: 'row',
            xl: 'row',
          }}
          spacing={2}
          width={'100%'}
        >
          <Box
            width={{ xs: '100%', sm: '100%', md: '100%', lg: '50%', xl: '50%' }}
          >
            <PendingContracts />
          </Box>
          <Box
            width={{ xs: '100%', sm: '100%', md: '100%', lg: '50%', xl: '50%' }}
          >
            <SchoolStarts />
          </Box>
        </Stack>
        <Stack
          direction={{
            xs: 'column',
            sm: 'column',
            md: 'column',
            lg: 'row',
            xl: 'row',
          }}
          spacing={2}
          width="100%"
        >
          <Box
            width={{ xs: '100%', sm: '100%', md: '100%', lg: '50%', xl: '50%' }}
          >
            <CockpitLeaves state={LeaveState.PENDING} />
          </Box>
          <Box
            width={{ xs: '100%', sm: '100%', md: '100%', lg: '50%', xl: '50%' }}
          >
            <CockpitLeaves state={LeaveState.ACCEPTED} />
          </Box>
        </Stack>
      </Stack>
    </Box>
  )
}

export default Cockpit
