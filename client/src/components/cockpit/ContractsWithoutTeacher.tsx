import { Box, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { CockpitComponent } from '../../pages/cockpit'

import { contractWithTeacher } from '../../types/contract'
import { useAuth } from '../AuthProvider'
import ContractList from '../ContractList'

const ContractsWithoutTeacher: CockpitComponent = ({ listSx }) => {
  const { API } = useAuth()
  const [contracts, setContracts] = useState<contractWithTeacher[]>([])
  const [refreshContracts, setRefreshContracts] = useState<number>(0)

  useEffect(() => {
    API.get('contracts/missingTeacher', {}).then((res) => {
      setContracts(res.data)
    })
  }, [refreshContracts])

  return (
    <>
      <Box
        p={4}
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: '4px',
        }}
      >
        <Stack direction="column" spacing={2} height={'100%'}>
          <Typography variant="h6">Lehrer zuweisen</Typography>
          <ContractList
            contracts={contracts}
            setContracts={setContracts}
            onSuccess={() => setRefreshContracts((r) => ++r)}
            sx={listSx}
          />
        </Stack>
      </Box>
    </>
  )
}

export default ContractsWithoutTeacher
