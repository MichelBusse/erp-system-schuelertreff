import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Contract } from '../entities/Contract.entity'
import { ContractsService } from '../services/contracts.service'
import { ContractsController } from '../controllers/contracts.controller'
import { SubjectsModule } from 'src/features/subjects/modules/subjects.module'
import { LessonsModule } from 'src/features/lessons/modules/lessons.module'
import { UsersModule } from 'src/features/users/modules/users.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Contract]),
    forwardRef(() => UsersModule),
    forwardRef(() => SubjectsModule),
    forwardRef(() => LessonsModule),
  ],
  providers: [ContractsService],
  controllers: [ContractsController],
  exports: [ContractsService],
})
export class ContractsModule {}
