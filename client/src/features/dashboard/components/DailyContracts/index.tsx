import ArrowBackIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIcon from '@mui/icons-material/ArrowForwardIos'
import { Box, IconButton, Stack, Typography } from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'

import { CockpitComponent } from '../../pages/Cockpit'
import ContractList from '../../../general/components/ContractList'
import { useAuth } from '../../../auth/components/AuthProvider'
import { Contract } from '../../../../core/types/Contract'

const DailyContracts: CockpitComponent = ({ listSx }) => {
  const { API } = useAuth()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [date, setDate] = useState<Dayjs>(dayjs())
  const [refreshContracts, setRefreshContracts] = useState<number>(0)

  useEffect(() => {
    API.get('contracts/day', {
      params: {
        date: date.format('YYYY-MM-DD'),
      },
    }).then((res) => {
      setContracts(res.data)
    })
  }, [date, refreshContracts])

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
          <Typography variant="h6">Tagesaktuelle Einsätze</Typography>
          <ContractList
            contracts={contracts}
            setContracts={setContracts}
            onSuccess={() => setRefreshContracts((r) => ++r)}
            sx={listSx}
          />
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent={'center'}
            width={'100%'}
          >
            <IconButton onClick={() => setDate((d) => d.subtract(1, 'day'))}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2">
              {`${date.format('DD.MM.YYYY')}`}
            </Typography>
            <IconButton onClick={() => setDate((d) => d.add(1, 'day'))}>
              <ArrowForwardIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Box>
    </>
  )
}

export default DailyContracts
