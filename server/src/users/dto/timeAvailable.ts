import { IsInt, Matches, Max, Min } from 'class-validator'

const regexTime = /^([01][0-9]|2[0-3]):([0-5][0-9])$/

export class timeAvailable {
  @IsInt()
  @Min(1)
  @Max(5)
  dow: number

  @Matches(regexTime, { message: 'start must be a valid 24h time' })
  start: string

  @Matches(regexTime, { message: 'end must be a valid 24h time' })
  end: string
}
