import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { User } from 'src/users/entities'

@Entity()
export class Document {
  @PrimaryGeneratedColumn()
  id: number

  @CreateDateColumn({ type: 'timestamptz' })
  createdDate: string

  @Column()
  fileName: string

  @Column()
  fileType: string

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  owner: User

  @Column({ default: true })
  visibleToUser: boolean

  @Column({ default: false })
  visibleToEverybody: boolean

  @Column({ default: true })
  mayDelete: boolean

  @Column({ type: 'bytea', select: false })
  content?: Buffer
}
