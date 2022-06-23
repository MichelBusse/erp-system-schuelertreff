import { Transform, Type } from 'class-transformer'
import { ArrayNotEmpty, IsInt, IsOptional, Max, Min } from 'class-validator'

import { IsTime24h } from 'src/IsTime24h.decorator'
import { IsValidDate } from 'src/IsValidDate.decorator'

export class SuggestContractsDto {
  @IsInt()
  subjectId: number

  @Type(() => String)
  @Transform(({ value }) => value.split(',').map(parseFloat))
  @ArrayNotEmpty()
  @IsInt({ each: true })
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
  minDate?: string

  @IsOptional()
  @IsValidDate()
  maxDate?: string
}