import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { Brackets, DataSource, Repository } from 'typeorm'
import { CreateUserDocumentDto } from '../dto/create-user-document.dto'
import { UserDocument } from '../entities/UserDocument.entity'
import { UpdateUserDocumentDto } from '../dto/update-user-document.dto'

@Injectable()
export class UserDocumentsService {
  constructor(
    @InjectRepository(UserDocument)
    private readonly documentsRepository: Repository<UserDocument>,

    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateUserDocumentDto): Promise<UserDocument> {
    const doc = this.documentsRepository.create({
      ...dto,
      owner: { id: dto.owner },
    })

    return this.documentsRepository.save(doc)
  }

  async update(
    id: number,
    dto: UpdateUserDocumentDto,
    userId?: number,
  ): Promise<UserDocument> {
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

  async findOne(id: number, userId?: number): Promise<UserDocument> {
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
    type: string,
  ): Promise<UserDocument[]> {
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

    if (type === 'private') {
      q.andWhere('doc."visibleToEverybody" = false')
    } else if (type === 'public') {
      q.andWhere('doc."visibleToEverybody" = true')
    }

    return q.getMany()
  }

  async getFile(id: number, userId?: number): Promise<UserDocument> {
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
