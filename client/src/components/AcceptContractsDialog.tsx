import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material'
import { Box } from '@mui/system'
import dayjs from 'dayjs'
import { useSnackbar } from 'notistack'

import { contract, ContractState } from '../types/contract'
import { useAuth } from './AuthProvider'

type Props = {
  contracts: contract[]
  open: boolean
  setOpen: (open: boolean) => void
  refresh: () => void
}

const AcceptContractsDialog: React.FC<Props> = ({
  contracts,
  open,
  refresh,
  setOpen,
}) => {
  const { API } = useAuth()
  const { enqueueSnackbar } = useSnackbar()

  const acceptOrDecline = (contract: contract, state: ContractState) => {
    API.post('contracts/acceptOrDecline/' + contract.id, {
      state: state,
    })
      .then(() => {
        setOpen(false)
        refresh()
      })
      .catch(() => {
        enqueueSnackbar('Ein Fehler ist aufgetreten')
      })
  }

  return (
    <Dialog open={open} keepMounted>
      <DialogTitle>{'Ausstehende Verträge'}</DialogTitle>
      <DialogContent>
        <Stack rowGap={2}>
          {contracts.map((c) => {
            return (
              <Box
                sx={{
                  backgroundColor: c.subject.color + '50',
                  padding: '15px',
                  borderRadius: '5px',
                }}
                key={c.id}
              >
                <Stack rowGap={2}>
                  <Stack direction={'row'} columnGap={2}>
                    <Stack direction={'column'} rowGap={2}>
                      <Stack
                        direction={'row'}
                        columnGap={2}
                        alignItems={'center'}
                        justifyContent={'space-between'}
                      >
                        <Typography>
                          <b>Fach:</b>
                        </Typography>
                        <Typography>{c.subject.name}</Typography>
                      </Stack>
                      <Stack
                        direction={'row'}
                        columnGap={2}
                        alignItems={'center'}
                        justifyContent={'space-between'}
                      >
                        <Typography>
                          <b>Interval:</b>
                        </Typography>
                        <Typography>
                          {c.interval === 1
                            ? 'Jede Woche'
                            : 'Alle ' + c.interval + ' Wochen'}
                        </Typography>
                      </Stack>
                      <Stack
                        direction={'row'}
                        columnGap={2}
                        alignItems={'center'}
                        justifyContent={'space-between'}
                      >
                        <Typography>
                          <b>Zeit:</b>
                        </Typography>
                        <Typography>
                          {dayjs(c.startTime, 'HH:mm').format('HH:mm')} bis{' '}
                          {dayjs(c.endTime, 'HH:mm').format('HH:mm')}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Stack direction={'column'} rowGap={2}>
                      <Stack
                        direction={'row'}
                        columnGap={2}
                        alignItems={'center'}
                        justifyContent={'space-between'}
                      >
                        <Typography>
                          <b>Start:</b>
                        </Typography>
                        <Typography>
                          {dayjs(c.startDate).format('DD.MM.YYYY')}
                        </Typography>
                      </Stack>
                      <Stack
                        direction={'row'}
                        columnGap={2}
                        alignItems={'center'}
                        justifyContent={'space-between'}
                      >
                        <Typography>
                          <b>Tag:</b>
                        </Typography>
                        <Typography>
                          {dayjs(c.startDate).format('dddd')}s
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                  <Stack
                    direction={'row'}
                    columnGap={2}
                    alignItems={'center'}
                    justifyContent={'flex-end'}
                  >
                    <Button
                      variant="text"
                      onClick={() => acceptOrDecline(c, ContractState.DECLINED)}
                    >
                      Ablehnen
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => acceptOrDecline(c, ContractState.ACCEPTED)}
                    >
                      Annehmen
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            )
          })}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          variant="text"
          onClick={() => setOpen(false)}
        >
          Abbrechen
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AcceptContractsDialog
