import { Dayjs } from "dayjs"

type CustomerInvoiceData = {
  invoiceNumber: number
  invoiceType: string
  invoicePreparationTime: number
  invoiceDate: Dayjs
}

export default CustomerInvoiceData;