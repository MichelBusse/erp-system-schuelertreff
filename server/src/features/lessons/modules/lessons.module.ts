import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Invoice } from 'src/features/contracts/entities/Invoice.entity'
import { ContractsModule } from 'src/features/contracts/modules/contracts.module'
import { LessonsService } from '../services/lessons.service'
import { LessonsController } from '../controllers/lessons.controller'
import { Lesson } from '../entities/lesson.entity'
import { UsersModule } from 'src/features/users/modules/users.module'

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
