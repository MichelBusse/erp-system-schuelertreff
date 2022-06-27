import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Subject {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column()
  shortForm: string

  @Column()
  color: string
}
