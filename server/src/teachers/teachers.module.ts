import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from './teacher.entity';
import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Teacher])],
  providers: [TeachersService],
  controllers: [TeachersController],
})
export class TeachersModule {}
