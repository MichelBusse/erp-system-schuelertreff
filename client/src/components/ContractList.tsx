import { Delete, Edit } from '@mui/icons-material'
import {
  IconButton,
  List,
  ListItem,
  ListItemText,
  useTheme,
} from '@mui/material'
import axios from 'axios'
import dayjs from 'dayjs'
import { useSnackbar } from 'notistack'
import { useState } from 'react'

import {
  contractStateToString,
  contractTypeToString,
  snackbarOptions,
  snackbarOptionsError,
} from '../consts'
import { contract, ContractState, contractWithTeacher } from '../types/contract'
import { useAuth } from './AuthProvider'
import ConfirmationDialog, {
  ConfirmationDialogProps,
  defaultConfirmationDialogProps,
} from './ConfirmationDialog'
import ContractDialog from './ContractDialog'

type Props = {
  contracts: contractWithTeacher[] | contract[]
  setContracts: React.Dispatch<React.SetStateAction<contractWithTeacher[]>>
  onSuccess?: () => void
}

const ContractList: React.FC<React.PropsWithChildren<Props>> = ({
  contracts,
  setContracts,
  onSuccess,
  children,
}) => {
  const { API } = useAuth()
  const { enqueueSnackbar } = useSnackbar()
  const [render, setRender] = useState<number>(0)
  const [initialContract, setInitialContract] = useState<
    contractWithTeacher | undefined
  >(undefined)
  const [open, setOpen] = useState<boolean>(false)
  const [confirmationDialogProps, setConfirmationDialogProps] =
    useState<ConfirmationDialogProps>(defaultConfirmationDialogProps)
  const theme = useTheme()

  const deleteContract = (contractId: number) => {
    setConfirmationDialogProps({
      open: true,
      setProps: setConfirmationDialogProps,
      title: 'Einsatz wirklich beenden?',
      text: 'Möchtest du den Einsatz wirklich beenden?',
      action: () => {
        API.delete('contracts/' + contractId)
          .then(() => {
            setContracts((prevContracts: contractWithTeacher[]) => {
              const newContracts: contractWithTeacher[] = []
              for (const c of prevContracts) {
                if (c.id !== contractId) newContracts.push(c)
              }
              return newContracts
            })
            enqueueSnackbar('Einsatz beendet', snackbarOptions)
          })
          .catch((error) => {
            if (axios.isAxiosError(error) && error.response?.status === 400) {
              enqueueSnackbar(
                (error.response.data as { message: string }).message,
                snackbarOptionsError,
              )
            } else {
              console.error(error)
              enqueueSnackbar(
                'Ein Fehler ist aufgetreten.',
                snackbarOptionsError,
              )
            }
          })
      },
    })
  }

  const editContract = (contract: contractWithTeacher) => {
    setInitialContract(contract)
    setRender((r) => ++r)
    setOpen(true)
  }

  return (
    <>
      <List
        dense={true}
        sx={{
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          margin: '5px 0',
          height: '100%',
        }}
      >
        {children}
        {contracts.length === 0 && (
          <ListItem>
            <ListItemText primary="Keine Einträge" />
          </ListItem>
        )}
        {contracts.map((contract) => (
          <ListItem
            key={contract.id}
            secondaryAction={
              <>
                <IconButton onClick={() => editContract(contract)}>
                  <Edit />
                </IconButton>
                {(!contract.endDate || dayjs(contract.endDate).isAfter(dayjs())) && (
                  <IconButton onClick={() => deleteContract(contract.id)}>
                    <Delete />
                  </IconButton>
                )}
              </>
            }
          >
            <ListItemText
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
                  {contract.endDate && !dayjs(contract.endDate, 'YYYY-MM-DD').isAfter(dayjs()) && (
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
      <ContractDialog
        key={render}
        open={open}
        setOpen={setOpen}
        onSuccess={() => {
          onSuccess && onSuccess()
        }}
        initialContract={initialContract}
      />
      <ConfirmationDialog confirmationDialogProps={confirmationDialogProps} />
    </>
  )
}

export default ContractList
