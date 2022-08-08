import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Subject } from './subject.entity'
import { SubjectsController } from './subjects.controller'
import { SubjectsService } from './subjects.service'

@Module({
  imports: [TypeOrmModule.forFeature([Subject])],
  providers: [SubjectsService],
  controllers: [SubjectsController],
})
export class SubjectsModule {}
