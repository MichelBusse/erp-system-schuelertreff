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

import { contractWithTeacher } from '../../types/contract'
import { useAuth } from '../AuthProvider'
import ContractDialog from '../ContractDialog'

const PendingContracts: React.FC = () => {
  const { API } = useAuth()
  const [pendingContracts, setPendingContracts] = useState<
    contractWithTeacher[]
  >([])
  const { enqueueSnackbar } = useSnackbar()
  const [refresh, setRefresh] = useState<number>(0)
  const [open, setOpen] = useState<boolean>(false)
  const [render, setRender] = useState<number>(0)
  const [initialContract, setInitialContract] =
    useState<contractWithTeacher | null>(null)

  useEffect(() => {
    API.get('contracts/pending').then((res) => {
      setPendingContracts(res.data)
    })
  }, [refresh])

  const deleteContract = (contractId: number) => {
    API.delete('contracts/' + contractId).then(() => {
      setPendingContracts((prevContracts) => {
        const newContracts: contractWithTeacher[] = []
        for (const c of prevContracts) {
          if (c.id !== contractId) newContracts.push(c)
        }
        return newContracts
      })
      enqueueSnackbar('Vertrag gelöscht')
    })
  }

  const editContract = (contract: contractWithTeacher) => {
    setInitialContract(contract)
    setRender((r) => ++r)
    setOpen(true)
  }

  return (
    <>
      <Box p={4} sx={{ backgroundColor: '#ffffff', borderRadius: '4px' }}>
        <Stack direction="column" spacing={2}>
          <Typography variant="h6">Ausstehende Verträge</Typography>
          <List
            dense={true}
            sx={{
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              margin: '5px 0',
            }}
          >
            {pendingContracts.length === 0 && (
              <ListItem>
                <ListItemText primary="keine Einträge" />
              </ListItem>
            )}
            {pendingContracts.map((contract) => (
              <ListItem
                key={contract.id}
                secondaryAction={
                  <>
                    <IconButton onClick={() => editContract(contract)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => deleteContract(contract.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </>
                }
              >
                <ListItemText
                  primary={`${contract.teacher.firstName} ${contract.teacher.lastName}`}
                  secondary={
                    dayjs(contract.startDate).format('dddd') +
                    ' ' +
                    dayjs(contract.startTime, 'HH:mm').format('HH:mm') +
                    ' - ' +
                    dayjs(contract.endTime, 'HH:mm').format('HH:mm')
                  }
                />
              </ListItem>
            ))}
          </List>
        </Stack>
      </Box>
      <ContractDialog
        key={render}
        open={open}
        setOpen={setOpen}
        onSuccess={() => setRefresh((r) => r + 1)}
        initialContract={initialContract}
      />
    </>
  )
}

export default PendingContracts
