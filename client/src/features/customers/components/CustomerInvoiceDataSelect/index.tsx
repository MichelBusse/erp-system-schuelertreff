import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useAuth } from '../../../auth/components/AuthProvider'
import InvoiceDataSelect from '../../../general/components/InvoiceDataSelect'
import CustomerInvoiceData from '../../../../core/types/CustomerInvoiceData'
import UserRole from '../../../../core/enums/UserRole.enum'

type Props = {
  generateInvoice: (
    year: number,
    month: number,
    invoiceData: CustomerInvoiceData,
  ) => void
  type: UserRole
}

const CustomerInvoiceDataSelect: React.FC<Props> = ({
  generateInvoice,
  type,
}) => {
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState<boolean>(false)
  const [invoiceDate, setInvoiceDate] = useState<{
    month: number
    year: number
  }>({
    month: dayjs().subtract(27, 'day').month(),
    year: dayjs().subtract(27, 'day').year(),
  })

  let defaultInvoiceData: CustomerInvoiceData = {
    invoiceNumber: 1,
    invoiceType: 'Nachhilfe',
    invoicePreparationTime: 0,
    invoiceDate: dayjs(),
  }

  if (type === UserRole.SCHOOL)
    defaultInvoiceData = {
      ...defaultInvoiceData,
      invoiceType: 'GTA',
      invoicePreparationTime: 15,
    }

  const [invoiceData, setInvoiceData] =
    useState<CustomerInvoiceData>(defaultInvoiceData)

  const { API } = useAuth()

  useEffect(() => {
    API.get('lessons/latestInvoice').then((res) => {
      setInvoiceData((data) => ({ ...data, invoiceNumber: res.data + 1 }))
    })
  }, [invoiceDialogOpen])

  return (
    <>
      <InvoiceDataSelect
        invoiceDate={invoiceDate}
        setInvoiceDate={setInvoiceDate}
        setInvoiceDialogOpen={setInvoiceDialogOpen}
      />
      <Dialog open={invoiceDialogOpen}>
        <DialogTitle>Rechnungsdaten</DialogTitle>
        <DialogContent>
          <Stack direction={'column'} rowGap={2} sx={{ marginTop: '5px' }}>
            <DatePicker
              label="Rechnungsdatum"
              mask="__.__.____"
              value={invoiceData.invoiceDate}
              onChange={(value) => {
                setInvoiceData((data) => ({
                  ...data,
                  invoiceDate: value ?? dayjs(),
                }))
              }}
              renderInput={(params) => (
                <TextField {...params} required variant="outlined" />
              )}
            />
            <TextField
              label={'Nummer'}
              type={'number'}
              value={invoiceData.invoiceNumber}
              onChange={(e) => {
                setInvoiceData((data) => ({
                  ...data,
                  invoiceNumber: Number(e.target.value),
                }))
              }}
            />
            <TextField
              label={'Typ'}
              value={invoiceData.invoiceType}
              onChange={(e) => {
                setInvoiceData((data) => ({
                  ...data,
                  invoiceType: e.target.value,
                }))
              }}
            />
            <TextField
              label={'Vorbereitungszeit (min)'}
              type={'number'}
              value={invoiceData.invoicePreparationTime}
              onChange={(e) => {
                setInvoiceData((data) => ({
                  ...data,
                  invoicePreparationTime: Number(e.target.value),
                }))
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setInvoiceDialogOpen(false)
              setInvoiceData(defaultInvoiceData)
            }}
          >
            Abbrechen
          </Button>
          <Button
            onClick={() => {
              generateInvoice(invoiceDate.year, invoiceDate.month, invoiceData)
              setInvoiceDialogOpen(false)
              setInvoiceData(defaultInvoiceData)
            }}
          >
            Erstellen
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default CustomerInvoiceDataSelect
