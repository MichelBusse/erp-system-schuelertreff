import ArrowBackIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIcon from '@mui/icons-material/ArrowForwardIos'
import {
  Box,
  IconButton,
  ListItem,
  Stack,
  Typography,
} from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'
import { contractWithTeacher } from '../../types/contract'

import { useAuth } from '../AuthProvider'
import ContractList from '../ContractList'

const ContractsWithoutTeacher: React.FC = () => {
  const { API } = useAuth()
  const [contracts, setContracts] = useState<contractWithTeacher[]>([])
  const [refreshContracts, setRefreshContracts] = useState<number>(0)

  useEffect(() => {
    API.get('contracts/missingTeacher', {
    }).then((res) => {
      setContracts(res.data)
    })
  }, [refreshContracts])

  return (
    <>
      <Box p={4} sx={{ backgroundColor: '#ffffff', borderRadius: '4px', height: '100%' }}>
        <Stack direction="column" spacing={2} height={'100%'}>
          <Typography variant="h6">Lehrer zuweisen</Typography>
          <ContractList
            contracts={contracts}
            setContracts={setContracts}
            onSuccess={() => setRefreshContracts((r) => ++r)}
          />
        </Stack>
      </Box>
    </>
  )
}

export default ContractsWithoutTeacher
