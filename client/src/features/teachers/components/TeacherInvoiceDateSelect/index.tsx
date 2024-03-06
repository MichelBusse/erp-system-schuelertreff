import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material'
import dayjs from 'dayjs'
import { useState } from 'react'
import InvoiceDataSelect from '../../../general/components/InvoiceDataSelect'
import TeacherInvoiceData from '../../../../core/types/TeacherInvoiceData'

type Props = {
  generateInvoice: (
    year: number,
    month: number,
    teacherInvoiceData: TeacherInvoiceData,
  ) => void
}

const TeacherInvoiceDataSelect: React.FC<Props> = ({ generateInvoice }) => {
  const [invoiceDate, setInvoiceDate] = useState<{
    month: number
    year: number
  }>({
    month: dayjs().subtract(27, 'day').month(),
    year: dayjs().subtract(27, 'day').year(),
  })
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState<boolean>(false)

  const defaultTeacherInvoiceData: TeacherInvoiceData = {
    kilometers: 0,
    costPerLiter: 1.9,
    consumption: 8,
  }

  const [teacherInvoiceData, setTeacherInvoiceData] =
    useState<TeacherInvoiceData>(defaultTeacherInvoiceData)

  return (
    <>
      <InvoiceDataSelect
        invoiceDate={invoiceDate}
        setInvoiceDate={setInvoiceDate}
        setInvoiceDialogOpen={setInvoiceDialogOpen}
      />
      <Dialog open={invoiceDialogOpen}>
        <DialogTitle>Abrechnungsdaten</DialogTitle>
        <DialogContent>
          <Stack direction={'column'} rowGap={2} sx={{ marginTop: '5px' }}>
            <TextField
              label={'Gefahrene Kilometer'}
              type={'number'}
              value={teacherInvoiceData.kilometers}
              onChange={(e) => {
                setTeacherInvoiceData((data) => ({
                  ...data,
                  kilometers: Number(e.target.value),
                }))
              }}
            />
            <TextField
              label={'Verbrauch ø in l'}
              type={'number'}
              value={teacherInvoiceData.consumption}
              onChange={(e) => {
                setTeacherInvoiceData((data) => ({
                  ...data,
                  consumption: Number(e.target.value),
                }))
              }}
            />
            <TextField
              label={'Preis (€/l)'}
              type={'number'}
              value={teacherInvoiceData.costPerLiter}
              onChange={(e) => {
                setTeacherInvoiceData((data) => ({
                  ...data,
                  costPerLiter: Number(e.target.value),
                }))
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setInvoiceDialogOpen(false)
              setTeacherInvoiceData(defaultTeacherInvoiceData)
            }}
          >
            Abbrechen
          </Button>
          <Button
            onClick={() => {
              generateInvoice(
                invoiceDate.year,
                invoiceDate.month,
                teacherInvoiceData,
              )
              setInvoiceDialogOpen(false)
              setTeacherInvoiceData(defaultTeacherInvoiceData)
            }}
          >
            Erstellen
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default TeacherInvoiceDataSelect
