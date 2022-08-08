import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'

import { Document } from './document.entity'
import { CreateDocumentDto } from './dto/create-document.dto'

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentsRepository: Repository<Document>,

    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateDocumentDto): Promise<Document> {
    const doc = this.documentsRepository.create({
      ...dto,
      owner: { id: dto.owner },
    })

    return this.documentsRepository.save(doc)
  }

  async delete(id: number, userId?: number) {
    const doc = await this.documentsRepository.findOne({
      where: { id },
      relations: ['owner'],
    })

    if (doc === null) throw new NotFoundException()

    if (typeof userId !== 'undefined') {
      if (doc.owner.id !== userId || !doc.mayRead) {
        throw new NotFoundException()
      } else if (!doc.mayDelete) {
        throw new ForbiddenException()
      }
    }

    return this.documentsRepository.delete(id)
  }

  async findOne(id: number, userId?: number): Promise<Document> {
    const doc = await this.documentsRepository.findOne({
      where: { id },
      relations: ['owner'],
    })

    if (doc === null) throw new NotFoundException()

    if (
      typeof userId !== 'undefined' &&
      (doc.owner.id !== userId || !doc.mayRead)
    ) {
      throw new NotFoundException()
    }

    return doc
  }

  async findAllBy(userId: number, showHidden: boolean): Promise<Document[]> {
    const q = this.documentsRepository
      .createQueryBuilder('doc')
      .select('doc')
      .where(`doc."ownerId" = :userId`, { userId })

    if (!showHidden) q.andWhere(`doc."mayRead" = true`)

    return q.getMany()
  }

  async getFile(id: number, userId?: number): Promise<Document> {
    const q = this.documentsRepository
      .createQueryBuilder('doc')
      .select('doc')
      .addSelect('doc.content')
      .where(`doc.id = :id`, { id })

    if (typeof userId !== 'undefined')
      q.andWhere(`doc."ownerId" = :userId`, { userId })

    return q.getOneOrFail()
  }
}
