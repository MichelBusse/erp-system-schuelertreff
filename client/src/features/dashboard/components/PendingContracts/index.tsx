import { Box, Stack, Typography } from '@mui/material'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

import { Contract } from '../../../../core/types/Contract'
import ContractList from '../../../general/components/ContractList'
import { useAuth } from '../../../auth/components/AuthProvider'
import ContractState from '../../../../core/enums/ContractState.enum'
import DashboardProps from '../../../../core/types/DashboardProps'

export default function PendingContracts({ listSx } : DashboardProps) {
  const { API } = useAuth()
  const [pendingContracts, setPendingContracts] = useState<
    Contract[]
  >([])
  const [refresh, setRefresh] = useState<number>(0)

  useEffect(() => {
    API.get('contracts/pending').then((res) => {
      const pendingContracts: Contract[] = res.data

      pendingContracts.sort((a, b) => {
        // Past contracts at top
        // Declined contracts next

        if (dayjs(a.endDate).isBefore(dayjs())) {
          if (dayjs(b.endDate).isBefore(dayjs())) {
            if (a.state === ContractState.DECLINED) return -1
            if (b.state === ContractState.DECLINED) return 1
          } else {
            return -1
          }
        } else {
          if (dayjs(b.endDate).isBefore(dayjs())) {
            return 1
          } else {
            if (a.state === ContractState.DECLINED) return -1
            if (b.state === ContractState.DECLINED) return 1
          }
        }

        return 0
      })

      setPendingContracts(res.data)
    })
  }, [refresh])

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
          <Typography variant="h6">Ausstehende Bestätigungen</Typography>
          <ContractList
            contracts={pendingContracts}
            setContracts={setPendingContracts}
            onSuccess={() => setRefresh((r) => r + 1)}
            allowTogglePast={true}
            sx={listSx}
          />
        </Stack>
      </Box>
    </>
  )
}