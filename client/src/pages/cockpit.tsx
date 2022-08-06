import { Box, Grid } from '@mui/material'

import { useAuth } from '../components/AuthProvider'
import CockpitLeaves from '../components/cockpit/CockpitLeaves'
import PendingContracts from '../components/cockpit/PendingContracts'
import { LeaveState } from '../types/enums'
import { Role } from '../types/user'

const Cockpit: React.FC = () => {
  const { hasRole } = useAuth()

  return (
    <Box sx={{ p: 4 }}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <PendingContracts />
        </Grid>
        {hasRole(Role.ADMIN) && (
          <Grid item xs={6}>
            <CockpitLeaves state={LeaveState.PENDING} />
          </Grid>
        )}
        {hasRole(Role.ADMIN) && (
          <Grid item xs={6}>
            <CockpitLeaves state={LeaveState.ACCEPTED} />
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

export default Cockpit
