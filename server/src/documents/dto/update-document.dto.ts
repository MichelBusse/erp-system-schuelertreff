import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator'

/**
 * Schema for updating a document
 */ 
export class UpdateDocumentDto {
  @IsNotEmpty()
  fileName: string

  @IsOptional()
  @IsBoolean()
  visibleToUser?: boolean

  @IsOptional()
  @IsBoolean()
  visibleToEverybody?: boolean

  @IsOptional()
  @IsBoolean()
  mayDelete?: boolean
}
