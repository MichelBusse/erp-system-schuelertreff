import { Transform, Type } from 'class-transformer'
import { IsInt, IsOptional, Max, Min } from 'class-validator'

import { IsTime24h } from 'src/core/decorators/IsTime24h.decorator'
import { IsValidDate } from 'src/core/decorators/IsValidDate.decorator'

/**
 * Schema for requesting time slot suggestions
 */ 
export class SuggestTimeSlotsDto {
  @IsInt()
  subjectId: number

  @Type(() => String)
  @Transform(({ value }) =>
    value === '' ? [] : value.split(',').map(parseFloat),
  )
  customers: number[]

  @IsOptional()
  @IsTime24h()
  startTime?: string

  @IsOptional()
  @IsTime24h()
  endTime?: string

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  dow?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  interval?: number

  @IsOptional()
  @IsValidDate()
  startDate?: string

  @IsOptional()
  @IsValidDate()
  endDate?: string

  @IsOptional()
  @Type(() => String)
  @Transform(({ value }) => value.split(',').map(parseFloat))
  @IsInt({ each: true })
  ignoreContracts: number[] = []

  @IsOptional()
  @IsInt()
  originalTeacher?: number
}
