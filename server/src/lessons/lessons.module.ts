import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { ContractsModule } from 'src/contracts/contracts.module'

import { Lesson } from './lesson.entity'
import { LessonsController } from './lessons.controller'
import { LessonsService } from './lessons.service'

@Module({
  imports: [TypeOrmModule.forFeature([Lesson]), ContractsModule],
  providers: [LessonsService],
  controllers: [LessonsController],
})
export class LessonsModule {}
