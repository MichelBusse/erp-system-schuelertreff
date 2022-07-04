import { IsNotEmpty } from 'class-validator'

export class CreateTeacherDto {
  @IsNotEmpty()
  lastName: string

  @IsNotEmpty()
  firstName: string

  @IsNotEmpty()
  email: string
}
