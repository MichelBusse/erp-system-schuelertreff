import { Delete, Edit } from '@mui/icons-material'
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  SxProps,
  useTheme,
} from '@mui/material'
import { Theme } from '@mui/system'
import axios from 'axios'
import dayjs from 'dayjs'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { Contract } from '../../../../core/types/Contract'
import { useAuth } from '../../../auth/components/AuthProvider'
import ConfirmationDialog from '../ConfirmationDialog'
import {
  SNACKBAR_OPTIONS,
  SNACKBAR_OPTIONS_ERROR,
} from '../../../../core/res/Constants'
import ContractState from '../../../../core/enums/ContractState.enum'
import { contractStateToString, contractTypeToString } from '../../../../core/utils/EnumToString'
import { DEFAULT_CONFIRMATION_DIALOG_DATA } from '../../../../core/res/Defaults'
import ContractCreateDialog from '../../../timetable/components/ContractDialogs/ContractCreateDialog'

type Props = {
  contracts: Contract[]
  setContracts: React.Dispatch<React.SetStateAction<Contract[]>>
  onSuccess?: () => void
  allowTogglePast?: boolean
  sx?: SxProps<Theme>
  userRole?: string
}

const ContractList: React.FC<React.PropsWithChildren<Props>> = ({
  contracts,
  setContracts,
  onSuccess,
  children,
  allowTogglePast = false,
  sx,
}) => {
  const { API } = useAuth()
  const { enqueueSnackbar } = useSnackbar()
  const [render, setRender] = useState<number>(0)
  const [initialContract, setInitialContract] = useState<Contract | undefined>()
  const [open, setOpen] = useState<boolean>(false)
  const [confirmationDialogData, setConfirmationDialogData] = useState(
    DEFAULT_CONFIRMATION_DIALOG_DATA,
  )

  const theme = useTheme()
  const [showPast, setShowPast] = useState(false)

  const deleteContract = (contractId: number) => {
    setConfirmationDialogData({
      open: true,
      setProps: setConfirmationDialogData,
      title: 'Einsatz wirklich löschen?',
      text: 'Es werden auch alle gehaltenen Stunden gelöscht und dieser Vorgang kann nicht mehr rückgängig gemacht werden.',
      action: () => {
        API.delete('contracts/' + contractId)
          .then(() => {
            setContracts((prevContracts: Contract[]) => {
              const newContracts: Contract[] = []
              for (const c of prevContracts) {
                if (c.id !== contractId) newContracts.push(c)
              }
              return newContracts
            })
            enqueueSnackbar('Einsatz gelöscht', SNACKBAR_OPTIONS)
          })
          .catch((error) => {
            if (axios.isAxiosError(error) && error.response?.status === 400) {
              enqueueSnackbar(
                (error.response.data as { message: string }).message,
                SNACKBAR_OPTIONS_ERROR,
              )
            } else {
              console.error(error)
              enqueueSnackbar(
                'Ein Fehler ist aufgetreten.',
                SNACKBAR_OPTIONS_ERROR,
              )
            }
          })
      },
    })
  }

  const editContract = (contract: Contract) => {
    setInitialContract(contract)
    setRender((r) => ++r)
    setOpen(true)
  }

  return (
    <>
      <List
        dense={true}
        sx={{
          position: 'relative',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          margin: '5px 0',
          height: '100%',
          overflowY: 'scroll',
          ...sx,
        }}
      >
        {allowTogglePast && (
          <ListItem sx={{ position: 'sticky', top: '0' }}>
            <Button onClick={() => setShowPast(!showPast)}>
              {showPast ? 'Vergangene ausblenden' : 'Vergangene einblenden'}
            </Button>
          </ListItem>
        )}
        {children}
        {contracts.length === 0 && (
          <ListItem>
            <ListItemText primary="Keine Einträge" />
          </ListItem>
        )}
        {contracts
          .filter((contract) => {
            if (showPast) {
              return true
            } else {
              if (
                !contract.endDate ||
                dayjs(contract.endDate).isAfter(dayjs())
              ) {
                return true
              } else {
                return false
              }
            }
          })
          .map((contract) => (
            <ListItem
              key={contract.id}
              secondaryAction={
                <Box>
                  {(!contract.endDate ||
                    dayjs(contract.endDate).isAfter(dayjs()) ||
                    contract.state !== ContractState.ACCEPTED) && (
                    <IconButton onClick={() => editContract(contract)}>
                      <Edit />
                    </IconButton>
                  )}
                  <IconButton onClick={() => deleteContract(contract.id)}>
                    <Delete color={'error'} />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText
                sx={{ marginRight: '50px' }}
                primary={
                  <>
                    <span>
                      {contract.subject.name +
                        ' (' +
                        contractTypeToString[contract.contractType] +
                        ')'}
                    </span>{' '}
                    <span>
                      {contract.state !== ContractState.ACCEPTED &&
                        `(${contractStateToString[contract.state]})`}
                    </span>
                    {contract.endDate &&
                      !dayjs(contract.endDate, 'YYYY-MM-DD').isAfter(
                        dayjs(),
                      ) && (
                        <span style={{ color: theme.palette.error.main }}>
                          {' '}
                          (Beendet)
                        </span>
                      )}
                  </>
                }
                secondary={
                  <>
                    <span>
                      {contract.teacher ? (
                        `${contract.teacher.firstName} ${contract.teacher.lastName}`
                      ) : (
                        <span style={{ color: theme.palette.error.main }}>
                          Keine Lehrkraft zugewiesen
                        </span>
                      )}
                    </span>
                    <br />
                    <span>
                      {contract.customers[0]?.role === 'classCustomer' &&
                        contract.customers[0].school.schoolName + ': '}
                      {contract.customers
                        .map((customer) => {
                          return customer.role === 'privateCustomer'
                            ? customer.firstName + ' ' + customer.lastName
                            : customer.className
                        })
                        .join(', ')}
                    </span>
                    <br />
                    <span>
                      {dayjs(contract.startDate).format('dddd') +
                        's ' +
                        dayjs(contract.startTime, 'HH:mm').format('HH:mm') +
                        ' - ' +
                        dayjs(contract.endTime, 'HH:mm').format('HH:mm')}
                    </span>
                    <br />
                    <span>
                      {dayjs(contract.startDate).format('DD.MM.YYYY') +
                        ' - ' +
                        (contract.endDate
                          ? dayjs(contract.endDate).format('DD.MM.YYYY')
                          : 'unbegrenzt')}
                    </span>
                  </>
                }
              />
            </ListItem>
          ))}
      </List>
      <ContractCreateDialog
        key={render}
        open={open}
        setOpen={setOpen}
        onSuccess={() => {
          onSuccess && onSuccess()
        }}
        initialContract={initialContract}
      />
      <ConfirmationDialog confirmationDialogData={confirmationDialogData} />
    </>
  )
}

export default ContractList
