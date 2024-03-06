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
import UserRole from 'src/core/enums/UserRole.enum'
import { UpdateUserDocumentDto } from '../dto/update-user-document.dto'
import { UserDocumentsService } from '../services/user-documents.service'
import { CreateUserDocumentDto } from '../dto/create-user-document.dto'
import { UserDocument } from '../entities/UserDocument.entity'

@Controller('documents')
export class UserDocumentsController {
  constructor(private readonly documentsService: UserDocumentsService) {}

  @Post(':id')
  async update(
    @Request() req,
    @Param('id') id: number,
    @Body() dto: UpdateUserDocumentDto,
  ) {
    // filter out content, doesn't need to be transferred back (huge overhead!)
    const { content: _, ...response } = await this.documentsService.update(
      id,
      {
        ...dto,
      },
      req.user.role === UserRole.ADMIN ? undefined : req.user.id,
    )

    return response
  }

  @Post()
  async create(@Request() req, @Body() dto: CreateUserDocumentDto) {
    // filter out content, doesn't need to be transferred back (huge overhead!)
    const { content: _, ...response } = await this.documentsService.create({
      ...dto,
      owner:
        req.user.role !== UserRole.ADMIN || !dto.owner ? req.user.id : dto.owner,
    })

    return response
  }

  @Get()
  async findAllBy(
    @Request() req,
    @Query('by') userId?: string,
    @Query('type') type?: string,
  ): Promise<UserDocument[]> {
    const id = userId ? Number(userId) : req.user.id

    const isAdmin = req.user.role === UserRole.ADMIN

    return this.documentsService.findAllBy(id, req.user.id, isAdmin, type)
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: number): Promise<UserDocument> {
    if (req.user.role === UserRole.ADMIN) {
      return this.documentsService.findOne(id)
    } else {
      return this.documentsService.findOne(id, req.user.id)
    }
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: number) {
    if (req.user.role === UserRole.ADMIN) {
      return this.documentsService.delete(id)
    } else {
      return this.documentsService.delete(id, req.user.id)
    }
  }

  @Get(':id/file')
  async getFile(@Request() req, @Res() res: Response, @Param('id') id: number) {
    let document: UserDocument

    if (req.user.role === UserRole.ADMIN) {
      document = await this.documentsService.getFile(id)
    } else {
      document = await this.documentsService.getFile(id, req.user.id)
    }

    res.set({
      'Content-Type': document.fileType,
      'Content-Disposition': `inline; filename="${document.fileName}"`,
      'Content-Length': document.content.length,
    })

    res.end(document.content)
  }
}
