import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { Box, IconButton, Stack, Typography } from '@mui/material'
import dayjs from 'dayjs'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'

import { ContractState, contractWithTeacher } from '../../types/contract'
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
      console.log(res.data)
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
          <Stack direction="column" spacing={2}>
            {pendingContracts.map((contract) => {
              return (
                <Stack
                  direction={'row'}
                  alignItems={'center'}
                  justifyContent={'space-between'}
                  key={contract.id}
                  sx={{
                    padding: '2px 16px',
                    borderRadius: '50px',
                    background:
                      contract.state === ContractState.PENDING
                        ? '#cccccc'
                        : '#cc6e6e',
                  }}
                >
                  <span>
                    {contract.teacher.firstName} {contract.teacher.lastName}
                  </span>
                  <span>{contract.subject.name}</span>
                  <span>{dayjs(contract.startDate).format('dddd')}s</span>
                  <div>
                    <IconButton>
                      <EditIcon onClick={() => editContract(contract)} />
                    </IconButton>
                    <IconButton onClick={() => deleteContract(contract.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </Stack>
              )
            })}
          </Stack>
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
