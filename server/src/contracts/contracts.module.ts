import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { LessonsModule } from 'src/lessons/lessons.module'
import { UsersModule } from 'src/users/users.module'

import { Contract } from './contract.entity'
import { ContractsController } from './contracts.controller'
import { ContractsService } from './contracts.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Contract]),
    forwardRef(() => UsersModule),
    forwardRef(() => LessonsModule),
  ],
  providers: [ContractsService],
  controllers: [ContractsController],
  exports: [ContractsService],
})
export class ContractsModule {}
