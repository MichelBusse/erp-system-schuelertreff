import { Transform, Type } from 'class-transformer'
import { IsBoolean, IsInt, IsNotEmpty, IsOptional } from 'class-validator'

/**
 * Schema for creating a document
 */ 
export class CreateUserDocumentDto {
  @IsNotEmpty()
  fileName: string

  @IsNotEmpty()
  fileType: string

  @IsOptional()
  @IsInt()
  owner?: number

  @IsOptional()
  @IsBoolean()
  visibleToUser?: boolean

  @IsOptional()
  @IsBoolean()
  visibleToEverybody?: boolean

  @IsOptional()
  @IsBoolean()
  mayDelete?: boolean

  @Type(() => String)
  @Transform(({ value }) => Buffer.from(value as string, 'base64'))
  content?: Buffer
}
