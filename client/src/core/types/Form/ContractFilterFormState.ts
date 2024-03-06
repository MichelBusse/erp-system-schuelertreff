import { Dayjs } from "dayjs"
import ClassCustomer from "../ClassCustomer"
import PrivateCustomer from "../PrivateCustomer"
import Subject from "../Subject"
import CustomerType from "../../enums/CustomerType.enum"
import ContractType from "../../enums/ContractType.enum"

type ContractFilterFormState = {
  school: {
    id: number
    schoolName: string
  } | null
  classCustomers: ClassCustomer[]
  privateCustomers: PrivateCustomer[]
  subject: Subject | null
  interval: number
  minStartDate: Dayjs | null
  startDate: Dayjs | null
  endDate: Dayjs | null
  dow: number | undefined
  startTime: Dayjs | null
  endTime: Dayjs | null
  customerType: CustomerType
  contractType: ContractType
}

export default ContractFilterFormState;