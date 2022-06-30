import subject from './subject'
import { customer } from './user'

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
}
