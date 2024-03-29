import { Box, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'

import { useAuth } from '../../../auth/components/AuthProvider'
import ContractList from '../../../general/components/ContractList'
import { Contract } from '../../../../core/types/Contract'
import DashboardProps from '../../../../core/types/DashboardProps'

export default function ContractsWithoutTeacher({ listSx }: DashboardProps) {
  const { API } = useAuth()
  const [contracts, setContracts] = useState<Contract[]>([])
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
          <Typography variant="h6">Lehrkraft zuweisen</Typography>
          <ContractList
            contracts={contracts}
            setContracts={setContracts}
            onSuccess={() => setRefreshContracts((r) => ++r)}
            sx={listSx}
            allowTogglePast={true}
          />
        </Stack>
      </Box>
    </>
  )
}
