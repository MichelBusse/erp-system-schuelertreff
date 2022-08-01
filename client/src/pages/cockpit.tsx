import { Box, Grid } from '@mui/material'

import { useAuth } from '../components/AuthProvider'
import PendingContracts from '../components/cockpit/PendingContracts'
import PendingLeaves from '../components/cockpit/PendingLeaves'
import { Role } from '../types/user'

const Cockpit: React.FC = () => {
  const { hasRole } = useAuth()

  return (
    <Box sx={{ p: 4 }}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <PendingContracts />
        </Grid>
        <Grid item xs={6}>
          {hasRole(Role.ADMIN) && <PendingLeaves />}
        </Grid>
      </Grid>
    </Box>
  )
}

export default Cockpit
