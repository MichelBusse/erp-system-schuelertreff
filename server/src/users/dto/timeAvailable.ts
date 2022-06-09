import { IsInt, Max, Min } from 'class-validator'

import { IsTime24h } from 'src/IsTime24h.decorator'

export class timeAvailable {
  @IsInt()
  @Min(1)
  @Max(5)
  dow: number

  @IsTime24h()
  start: string

  @IsTime24h()
  end: string
}
