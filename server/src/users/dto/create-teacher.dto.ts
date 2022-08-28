import { IsBoolean, IsNotEmpty } from 'class-validator'

import { IsValidDate } from 'src/IsValidDate.decorator'

export class CreateTeacherDto {
  @IsNotEmpty()
  lastName: string

  @IsNotEmpty()
  firstName: string

  @IsNotEmpty()
  email: string

  @IsNotEmpty()
  applicationLocation: string

  @IsValidDate()
  dateOfApplication: string

  @IsBoolean()
  skip: boolean
}
