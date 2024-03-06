import { IsInt, Max, Min } from 'class-validator'
import { IsTime24h } from '../decorators/IsTime24h.decorator'


/**
 * Model for a TimeSlot
 */ 
export class TimeSlot {
  @IsInt()
  @Min(1)
  @Max(5)
  dow: number

  @IsTime24h()
  start: string

  @IsTime24h()
  end: string
}
