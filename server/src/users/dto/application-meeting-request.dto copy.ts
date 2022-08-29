import { Type } from 'class-transformer'
import { IsArray, IsOptional, ValidateNested } from 'class-validator'
import { Dayjs } from 'dayjs'

import { IsValidDate } from 'src/IsValidDate.decorator'
import { Subject } from 'src/subjects/subject.entity'

import { TeacherState } from '../entities/teacher.entity'
import { TeacherSchoolType } from '../entities/user.entity'
import { UpdateUserDto } from './update-user.dto'

export class ApplicationMeetingRequestDto extends UpdateUserDto {
  dates: (string | null)[]

  fixedRequest: boolean
}
