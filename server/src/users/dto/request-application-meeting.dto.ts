import { UpdateUserDto } from './update-user.dto'

/**
 * Schema for requesting a meeting with an applicant
 */ 
export class RequestApplicationMeetingDto extends UpdateUserDto {
  dates: (string | null)[]

  fixedRequest: boolean
}
