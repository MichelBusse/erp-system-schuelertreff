import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from '@mui/material'
import dayjs from 'dayjs'

type Props = {
  invoiceDate: {
    month: number
    year: number
  }
  setInvoiceDate: React.Dispatch<
    React.SetStateAction<{
      month: number
      year: number
    }>
  >
  setInvoiceDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const InvoiceDataSelect: React.FC<Props> = ({
  invoiceDate,
  setInvoiceDate,
  setInvoiceDialogOpen,
}) => {
  return (
    <>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
              .filter(
                (e) =>
                  invoiceDate.year < dayjs().year() || e <= dayjs().month(),
              )
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
          onClick={() => setInvoiceDialogOpen(true)}
        >
          Generieren
        </Button>
      </Stack>
    </>
  )
}

export default InvoiceDataSelect
