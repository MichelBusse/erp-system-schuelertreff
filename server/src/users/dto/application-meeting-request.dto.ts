import { UpdateUserDto } from './update-user.dto'

export class ApplicationMeetingRequestDto extends UpdateUserDto {
  dates: (string | null)[]

  fixedRequest: boolean
}
