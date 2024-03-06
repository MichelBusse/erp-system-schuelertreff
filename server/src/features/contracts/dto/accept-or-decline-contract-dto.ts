import ContractState from "src/core/enums/ContractState.enum";

/**
 * Schema for changing the state of a contract 
 */ 
export class AcceptOrDeclineContractDto {
  state: ContractState
}
