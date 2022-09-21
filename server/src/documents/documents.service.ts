import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import ejs from 'ejs'
import path from 'path'
import * as puppeteer from 'puppeteer'
import { Brackets, DataSource, Repository } from 'typeorm'

import { Document } from './document.entity'
import { CreateDocumentDto } from './dto/create-document.dto'
import { UpdateDocumentDto } from './dto/update-document.dto'

/**
 * render document from template
 */
export async function renderTemplate(
  template: string,
  data?: ejs.Data,
  margin?: puppeteer.PDFMargin,
): Promise<Buffer> {
  const filePath = path.join(
    __dirname,
    '../templates',
    template.replace('/', '') + '.ejs',
  )

  const content = await ejs.renderFile(filePath, data)

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/bin/chromium-browser',
    args: [
      '--no-sandbox',
      '--headless',
      '--disable-gpu',
      '--disable-dev-shm-usage',
    ],
  })
  const page = await browser.newPage()
  await page.setContent(content)

  const buffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: margin ?? {
      left: '40px',
      top: '40px',
      right: '40px',
      bottom: '40px',
    },
  })

  await browser.close()

  return buffer
}

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

  async update(
    id: number,
    dto: UpdateDocumentDto,
    userId?: number,
  ): Promise<Document> {
    let doc = await this.documentsRepository.findOneOrFail({
      where: { id },
      relations: ['owner'],
    })

    if (userId && userId !== doc.owner.id) throw new ForbiddenException()

    doc = { ...doc, ...dto }

    return this.documentsRepository.save(doc)
  }

  async delete(id: number, userId?: number) {
    const doc = await this.documentsRepository.findOne({
      where: { id },
      relations: ['owner'],
    })

    if (userId && userId !== doc.owner.id) throw new ForbiddenException()

    if (doc === null) throw new NotFoundException()

    if (userId) {
      if (
        (doc.owner.id === userId && !doc.visibleToUser) ||
        (doc.owner.id !== userId && !doc.visibleToEverybody)
      ) {
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
      ((doc.owner.id === userId && !doc.visibleToUser) ||
        (doc.owner.id !== userId && !doc.visibleToEverybody))
    ) {
      throw new NotFoundException()
    }

    return doc
  }

  async findAllBy(
    ownerId: number,
    userId: number,
    isAdmin: boolean,
  ): Promise<Document[]> {
    const q = this.documentsRepository
      .createQueryBuilder('doc')
      .select('doc')
      .where(`doc."ownerId" = :ownerId`, { ownerId })

    if (!isAdmin) {
      q.andWhere(
        new Brackets((qb) => {
          qb.where(`(doc."ownerId" = :userId AND doc."visibleToUser" = true)`, {
            userId,
          })
          qb.orWhere(
            `(doc."ownerId" <> :userId AND doc."visibleToEverybody" = true)`,
          )
        }),
      )
    }

    return q.getMany()
  }

  async getFile(id: number, userId?: number): Promise<Document> {
    const q = this.documentsRepository
      .createQueryBuilder('doc')
      .select('doc')
      .addSelect('doc.content')
      .where(`doc.id = :id`, { id })

    if (userId) {
      q.andWhere(
        new Brackets((qb) => {
          qb.where(`(doc."ownerId" = :userId AND doc."visibleToUser" = true)`, {
            userId,
          })
          qb.orWhere(
            `(doc."ownerId" <> :userId AND doc."visibleToEverybody" = true)`,
          )
        }),
      )
    }

    return q.getOneOrFail()
  }
}
