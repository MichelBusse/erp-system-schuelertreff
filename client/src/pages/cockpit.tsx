import { Box, Grid } from '@mui/material'

import PendingContracts from '../components/cockpit/PendingContracts'

const Cockpit: React.FC = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <PendingContracts />
        </Grid>
      </Grid>
    </Box>
  )
}

export default Cockpit
