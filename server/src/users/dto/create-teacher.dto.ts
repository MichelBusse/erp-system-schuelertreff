import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator'

import { IsValidDate } from 'src/IsValidDate.decorator'

export class CreateTeacherDto {
  @IsNotEmpty()
  lastName: string

  @IsNotEmpty()
  firstName: string

  @IsNotEmpty()
  email: string

  @IsOptional()
  applicationLocation: string

  @IsOptional()
  @IsValidDate()
  dateOfApplication: string | null

  @IsBoolean()
  skip: boolean
}
