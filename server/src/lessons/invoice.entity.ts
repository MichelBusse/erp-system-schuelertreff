import { Column, Entity, PrimaryGeneratedColumn, Timestamp } from 'typeorm'

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'timestamptz', default: () => "CURRENT_TIMESTAMP" })
  generationTime: Date

  @Column()
  number: number
}
