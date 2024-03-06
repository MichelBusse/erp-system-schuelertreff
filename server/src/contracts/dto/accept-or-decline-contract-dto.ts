import { ContractState } from '../contract.entity'


/**
 * Schema for changing the state of a contract 
 */ 
export class AcceptOrDeclineContractDto {
  state: ContractState
}
