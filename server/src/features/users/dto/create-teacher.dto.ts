import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator'

import { IsValidDate } from 'src/core/decorators/IsValidDate.decorator'
import { CreateUserDto } from './create-user.dto'

/**
 * Schema for creating a teacher
 */ 
export class CreateTeacherDto extends CreateUserDto {
  @IsNotEmpty()
  lastName: string

  @IsNotEmpty()
  firstName: string

  @IsOptional()
  applicationLocation: string

  @IsOptional()
  @IsValidDate()
  dateOfApplication: string | null

  @IsBoolean()
  skip: boolean
}
