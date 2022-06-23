import { ArrayNotEmpty, IsInt, Max, Min } from 'class-validator'

export class CreateContractDto {
  @ArrayNotEmpty()
  @IsInt({ each: true })
  customers: number[]

  @IsInt()
  teacher: number

  @IsInt()
  subject: number

  startTime: string

  endTime: string

  startDate: string

  endDate: string

  @Min(1)
  @Max(4)
  @IsInt()
  interval: number
}
