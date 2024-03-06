import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SubjectsService } from '../services/subjects.service'
import { SubjectsController } from '../controllers/subjects.controller'
import { Subject } from '../entities/subject.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Subject])],
  providers: [SubjectsService],
  controllers: [SubjectsController],
  exports: [SubjectsService],
})
export class SubjectsModule {}
