import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { ContractsModule } from 'src/contracts/contracts.module'
import { UsersModule } from 'src/users/users.module'
import { Invoice } from './invoice.entity'

import { Lesson } from './lesson.entity'
import { LessonsController } from './lessons.controller'
import { LessonsService } from './lessons.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Lesson, Invoice]),
    forwardRef(() => ContractsModule),
    forwardRef(() => UsersModule),
  ],
  providers: [LessonsService],
  controllers: [LessonsController],
  exports: [LessonsService],
})
export class LessonsModule {}
