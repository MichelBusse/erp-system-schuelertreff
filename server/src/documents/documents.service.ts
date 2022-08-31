import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import ejs from 'ejs'
import path from 'path'
import * as puppeteer from 'puppeteer'
import { DataSource, Repository } from 'typeorm'

import { Document } from './document.entity'
import { CreateDocumentDto } from './dto/create-document.dto'

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
