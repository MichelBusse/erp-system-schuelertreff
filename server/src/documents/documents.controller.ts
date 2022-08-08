import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  Res,
} from '@nestjs/common'
import { Response } from 'express'

import { Role } from 'src/auth/role.enum'

import { Document } from './document.entity'
import { DocumentsService } from './documents.service'
import { CreateDocumentDto } from './dto/create-document.dto'

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  async create(@Request() req, @Body() dto: CreateDocumentDto) {
    // filter out content, doesn't need to be transferred back (huge overhead!)
    const { content: _, ...response } = await this.documentsService.create({
      ...dto,
      owner:
        req.user.role !== Role.ADMIN || !dto.owner ? req.user.id : dto.owner,
    })

    return response
  }

  @Get()
  async findAllBy(
    @Request() req,
    @Query('by') userId?: number,
  ): Promise<Document[]> {
    const id =
      req.user.role === Role.ADMIN ? userId ?? req.user.userId : req.user.id

    const showHidden = id !== req.user.id

    return this.documentsService.findAllBy(id, showHidden)
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: number): Promise<Document> {
    if (req.user.role === Role.ADMIN) {
      return this.documentsService.findOne(id)
    } else {
      return this.documentsService.findOne(id, req.user.id)
    }
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: number) {
    if (req.user.role === Role.ADMIN) {
      return this.documentsService.delete(id)
    } else {
      return this.documentsService.delete(id, req.user.id)
    }
  }

  @Get(':id/file')
  async getFile(@Request() req, @Res() res: Response, @Param('id') id: number) {
    let document: Document

    if (req.user.role === Role.ADMIN) {
      document = await this.documentsService.getFile(id)
    } else {
      document = await this.documentsService.getFile(id, req.user.id)
    }

    res.set({
      'Content-Type': document.fileType,
      'Content-Disposition': `Content-Disposition: inline; filename="${document.fileName}"`,
      'Content-Length': document.content.length,
    })

    res.end(document.content)
  }
}
