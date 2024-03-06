import ContractState from '../enums/ContractState.enum'
import ContractType from '../enums/ContractType.enum'
import Customer from './Customer'
import Teacher from './Teacher'
import subject from './Subject'
import Lesson from './Lesson'

export type Contract = {
  id: number
  startTime: string
  endTime: string
  startDate: string
  endDate: string
  interval: 1
  subject: subject
  customers: Customer[]
  teacher: Teacher
  state: ContractState
  contractType: ContractType
  blocked?: boolean
  parentContract?: Contract
  childContracts: Contract[]
  lessons: Lesson[]
}