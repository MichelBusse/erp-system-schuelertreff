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
import { useAuth } from '../../../auth/components/AuthProvider'
import { SNACKBAR_OPTIONS_ERROR } from '../../../../core/res/Constants'
import { Contract } from '../../../../core/types/Contract'
import ContractState from '../../../../core/enums/ContractState.enum'
import ContractType from '../../../../core/enums/ContractType.enum'

type Props = {
  contracts: Contract[]
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

  const acceptOrDecline = (contract: Contract, state: ContractState) => {
    API.post('contracts/acceptOrDecline/' + contract.id, {
      state: state,
    })
      .then(() => {
        setOpen(false)
        refresh()
      })
      .catch(() => {
        enqueueSnackbar('Ein Fehler ist aufgetreten', SNACKBAR_OPTIONS_ERROR)
      })
  }

  return (
    <Dialog open={open} keepMounted>
      <DialogTitle>{'Ausstehende Einsätze'}</DialogTitle>
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
                  {c.customers && c.customers[0].role === 'classCustomer' && (
                    <Stack
                      direction={'row'}
                      columnGap={2}
                      alignItems={'center'}
                      justifyContent={'space-between'}
                    >
                      <Typography>
                        <b>Schule:</b>
                      </Typography>
                      <Typography>
                        {c.customers[0].school.schoolName}
                      </Typography>
                    </Stack>
                  )}
                  <Stack
                    direction={'row'}
                    columnGap={2}
                    alignItems={'center'}
                    justifyContent={'space-between'}
                  >
                    <Typography>
                      <b>
                        {c.customers[0]?.role === 'privateCustomer'
                          ? 'Schüler:'
                          : 'Klassen:'}
                      </b>
                    </Typography>
                    <Typography>
                      {c.customers
                        ? c.customers
                            .map((c) => {
                              return c.role === 'privateCustomer'
                                ? c.firstName + ' ' + c.lastName
                                : c.className
                            })
                            .join(', ')
                        : ''}
                    </Typography>
                  </Stack>
                  {c.customers && c.customers[0].role === 'classCustomer' && (
                    <Stack
                      direction={'row'}
                      columnGap={2}
                      alignItems={'center'}
                      justifyContent={'space-between'}
                    >
                      <Typography>
                        <b>Adresse:</b>
                      </Typography>
                      <Typography>
                        {c.customers[0].school.street +
                          ', ' +
                          c.customers[0].school.postalCode +
                          ', ' +
                          c.customers[0].school.city}
                      </Typography>
                    </Stack>
                  )}
                  <Stack direction={'column'} rowGap={2} width="100%">
                    <Stack
                      direction={'row'}
                      columnGap={2}
                      alignItems={'center'}
                      justifyContent={'space-between'}
                    >
                      <Typography>
                        <b>Fach:</b>
                      </Typography>
                      <Typography>
                        {c.subject.name +
                          (c.contractType === ContractType.STANDARD
                            ? ' (Präsenz)'
                            : ' (Online)')}
                      </Typography>
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
        <Button variant="text" onClick={() => setOpen(false)}>
          Abbrechen
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AcceptContractsDialog
