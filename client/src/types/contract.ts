import subject from './subject'
import { customer, teacher } from './user'

export enum ContractState {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
}

export type contract = {
  id: number
  startTime: string
  endTime: string
  startDate: string
  endDate: string
  interval: 1
  subject: subject
  customers: customer[]
  teacher: number
  state: ContractState
  parentContract?: contract
  childContracts: contract[]
}
export type contractWithTeacher = {
  id: number
  startTime: string
  endTime: string
  startDate: string
  endDate: string
  interval: 1
  subject: subject
  customers: customer[]
  teacher: teacher
  state: ContractState
}
