import { IsEnum, IsOptional, IsString } from 'class-validator'

import { IsValidDate } from 'src/core/decorators/IsValidDate.decorator'
import LeaveState from 'src/core/enums/LeaveState.enum'
import LeaveType from 'src/core/enums/LeaveType.enum'

/**
 * Schema for creating a updating a leave
 */ 
export class LeaveDto {
  @IsString()
  @IsValidDate()
  startDate?: string

  @IsString()
  @IsValidDate()
  endDate?: string

  @IsOptional()
  @IsEnum(LeaveState)
  state?: LeaveState

  @IsEnum(LeaveType)
  type?: LeaveType

  attachment?: Buffer
}
