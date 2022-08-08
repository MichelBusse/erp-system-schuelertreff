import { Transform, Type } from 'class-transformer'
import { IsBoolean, IsInt, IsNotEmpty, IsOptional } from 'class-validator'

export class CreateDocumentDto {
  @IsNotEmpty()
  fileName: string

  @IsNotEmpty()
  fileType: string

  @IsOptional()
  @IsInt()
  owner?: number

  @IsOptional()
  @IsBoolean()
  mayRead?: boolean

  @IsOptional()
  @IsBoolean()
  mayDelete?: boolean

  @Type(() => String)
  @Transform(({ value }) => Buffer.from(value as string, 'base64'))
  content?: Buffer
}
