import { ContractType } from './enums'
import { lesson } from './lesson'
import subject from './subject'
import { customer, leave, teacher } from './user'

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
  teacher: teacher
  state: ContractState
  parentContract?: contract
  childContracts: contract[]
  lessons: lesson[]
  contractType: ContractType
  blocked?: boolean
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
  contractType: ContractType
  blocked?: boolean
}

export type suggestion = {
  teacherId: number
  teacherName: string
  suggestions: {
    dow: number
    start: string
    end: string
    overlap: number[]
  }[]
  leave: leave[]
}