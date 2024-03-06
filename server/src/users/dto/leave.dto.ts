import { IsEnum, IsOptional, IsString } from 'class-validator'

import { IsValidDate } from 'src/IsValidDate.decorator'

import { LeaveState, LeaveType } from '../entities/leave.entity'

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
