import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from '@mui/material'
import dayjs from 'dayjs'
import { useState } from 'react'

type Props = {
  generateInvoice: (year: number, month: number) => void
}

const InvoiceDataSelect: React.FC<Props> = ({ generateInvoice }) => {
  const [invoiceData, setInvoiceData] = useState<{
    month: number
    year: number
  }>({
    month: dayjs().subtract(27, 'day').month(),
    year: dayjs().subtract(27, 'day').year(),
  })

  return (
    <Stack direction={'row'} columnGap={2}>
      <FormControl fullWidth>
        <InputLabel id="invoiceYearLabel">Jahr</InputLabel>
        <Select
          id="invoiceYear"
          label="Jahr"
          value={invoiceData.year}
          onChange={(event) => {
            if (
              event.target.value === dayjs().year() &&
              invoiceData.month >= dayjs().subtract(27, 'day').month()
            ) {
              setInvoiceData((data) => ({
                ...data,
                year: dayjs().subtract(1, 'month').year(),
                month: dayjs().subtract(1, 'month').month(),
              }))
            } else {
              setInvoiceData((data) => ({
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
          value={invoiceData.month}
          onChange={(event) =>
            setInvoiceData((data) => ({
              ...data,
              month: event.target.value as number,
            }))
          }
        >
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
            .filter((e) => {
              if (invoiceData.year < dayjs().year() || e < dayjs().month()) {
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
        onClick={() => generateInvoice(invoiceData.year, invoiceData.month)}
      >
        Generieren
      </Button>
    </Stack>
  )
}

export default InvoiceDataSelect
