import TeacherState from 'src/core/enums/TeacherState.enum'
import UserRole from 'src/core/enums/UserRole.enum'
import { ChildEntity, Column, JoinTable, ManyToMany } from 'typeorm'
import { User } from './user.entity'
import TeacherDegree from 'src/core/enums/TeacherDegree.enum'
import TeacherSchoolType from 'src/core/enums/TeacherSchoolType.enum'
import { Subject } from 'src/features/subjects/entities/subject.entity'

@ChildEntity()
export class Teacher extends User {
  role = UserRole.TEACHER

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  fee: number

  @Column({
    type: 'enum',
    enum: TeacherState,
  })
  state: TeacherState

  @Column({
    type: 'enum',
    default: TeacherDegree.NOINFO,
    enum: TeacherDegree,
  })
  degree: TeacherDegree

  @Column({
    type: 'enum',
    enum: TeacherSchoolType,
    array: true,
    default: '{}',
  })
  teacherSchoolTypes: TeacherSchoolType[]

  @ManyToMany(() => Subject)
  @JoinTable()
  subjects: Subject[]

  @Column({
    type: 'date',
    nullable: true,
  })
  dateOfBirth: string

  @Column({
    type: 'date',
    nullable: true,
  })
  dateOfEmploymentStart: string

  @Column({
    type: 'text',
    default: '',
  })
  bankAccountOwner: string

  @Column({
    type: 'text',
    default: '',
  })
  bankInstitution: string

  @Column({
    type: 'text',
    default: '',
  })
  iban: string

  @Column({
    type: 'text',
    default: '',
  })
  bic: string

  @Column({
    type: 'date',
    nullable: true,
  })
  dateOfApplication: string

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  dateOfApplicationMeeting: string

  @Column({
    type: 'text',
    default: '',
  })
  applicationLocation: string
}
