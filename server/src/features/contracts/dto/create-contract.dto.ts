import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator'

import { IsTime24h } from 'src/core/decorators/IsTime24h.decorator'
import { IsValidDate } from 'src/core/decorators/IsValidDate.decorator'
import ContractState from 'src/core/enums/ContractState.enum'

/**
 * Schema for creating a contract
 */ 
export class CreateContractDto {
  customers: number[]

  teacher: string

  @IsInt()
  subject: number

  @IsTime24h()
  startTime: string

  @IsTime24h()
  endTime: string

  @IsValidDate()
  startDate: string

  @IsOptional()
  @IsValidDate()
  endDate: string

  @Min(1)
  @Max(4)
  @IsInt()
  interval: number

  @IsOptional()
  @IsInt()
  parentContract?: number

  @IsOptional()
  @IsEnum(ContractState)
  state?: ContractState

  @IsOptional()
  @IsInt()
  initialContractId?: number

  @IsOptional()
  @IsInt()
  schoolId?: number
}
