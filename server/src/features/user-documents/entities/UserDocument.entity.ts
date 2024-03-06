import { User } from 'src/features/users/entities/user.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
export class UserDocument {
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
