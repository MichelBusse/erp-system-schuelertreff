import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import dayjs from 'dayjs'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'

import { ContractState, contractWithTeacher } from '../../types/contract'
import { useAuth } from '../AuthProvider'
import ContractDialog from '../ContractDialog'
import ContractList from '../ContractList'

const PendingContracts: React.FC = () => {
  const { API } = useAuth()
  const [pendingContracts, setPendingContracts] = useState<
    contractWithTeacher[]
  >([])
  const [refresh, setRefresh] = useState<number>(0)

  useEffect(() => {
    API.get('contracts/pending').then((res) => {
      setPendingContracts(res.data)
    })
  }, [refresh])

  return (
    <>
      <Box p={4} sx={{ backgroundColor: '#ffffff', borderRadius: '4px' }}>
        <Stack direction="column" spacing={2} height={'100%'}>
          <Typography variant="h6">Ausstehende Bestätigungen</Typography>
          <ContractList
            contracts={pendingContracts}
            setContracts={setPendingContracts}
            onSuccess={() => setRefresh((r) => r + 1)}
          />
        </Stack>
      </Box>
    </>
  )
}

export default PendingContracts
