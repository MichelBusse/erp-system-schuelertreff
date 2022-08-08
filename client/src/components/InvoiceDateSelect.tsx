import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs, { Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'

import { Role } from '../types/user'
import { useAuth } from './AuthProvider'

export type InvoiceData = {
  invoiceNumber: number
  invoiceType: string
  invoicePreparationTime: number
  invoiceDate: Dayjs
}

type Props = {
  generateInvoice: (
    year: number,
    month: number,
    invoiceData?: InvoiceData,
  ) => void
  type: Role
}

const InvoiceDataSelect: React.FC<Props> = ({ generateInvoice, type }) => {
  const [invoiceDate, setInvoiceDate] = useState<{
    month: number
    year: number
  }>({
    month: dayjs().subtract(27, 'day').month(),
    year: dayjs().subtract(27, 'day').year(),
  })
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState<boolean>(false)

  let defaultInvoiceData: InvoiceData = {
    invoiceNumber: 1,
    invoiceType: 'Nachhilfe',
    invoicePreparationTime: 0,
    invoiceDate: dayjs(),
  }

  if (type === Role.SCHOOL)
    defaultInvoiceData = {
      ...defaultInvoiceData,
      invoiceType: 'GTA',
      invoicePreparationTime: 15,
    }

  const [invoiceData, setInvoiceData] =
    useState<InvoiceData>(defaultInvoiceData)

  const { API } = useAuth()

  useEffect(() => {
    API.get('lessons/latestInvoice').then((res) => {
      setInvoiceData((data) => ({ ...data, invoiceNumber: res.data + 1 }))
    })
  }, [invoiceDialogOpen])

  return (
    <>
      <Stack direction={'row'} columnGap={2}>
        <FormControl fullWidth>
          <InputLabel id="invoiceYearLabel">Jahr</InputLabel>
          <Select
            id="invoiceYear"
            label="Jahr"
            value={invoiceDate.year}
            onChange={(event) => {
              if (
                event.target.value === dayjs().year() &&
                invoiceDate.month >= dayjs().subtract(27, 'day').month()
              ) {
                setInvoiceDate((data) => ({
                  ...data,
                  year: dayjs().subtract(1, 'month').year(),
                  month: dayjs().subtract(1, 'month').month(),
                }))
              } else {
                setInvoiceDate((data) => ({
                  ...data,
                  year: event.target.value as number,
                }))
              }
            }}
          >
            {[
              dayjs().year(),
              dayjs().year() - 1,
              dayjs().year() - 2,
              dayjs().year() - 3,
            ].map((e) => (
              <MenuItem value={e} key={e}>
                {e}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel id="invoiceMonthLabel">Monat</InputLabel>
          <Select
            id="invoiceMonth"
            label="Monat"
            value={invoiceDate.month}
            onChange={(event) =>
              setInvoiceDate((data) => ({
                ...data,
                month: event.target.value as number,
              }))
            }
          >
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
              .filter((e) => {
                if (invoiceDate.year < dayjs().year() || e < dayjs().month()) {
                  return true
                }
                return false
              })
              .map((e) => (
                <MenuItem value={e} key={e}>
                  {dayjs().month(e).format('MMMM')}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        <Button
          variant={'outlined'}
          fullWidth
          onClick={() => {
            if (type === Role.PRIVATECUSTOMER || type === Role.SCHOOL) {
              setInvoiceDialogOpen(true)
            } else {
              generateInvoice(invoiceDate.year, invoiceDate.month)
            }
          }}
        >
          Generieren
        </Button>
      </Stack>
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

export default InvoiceDataSelect
