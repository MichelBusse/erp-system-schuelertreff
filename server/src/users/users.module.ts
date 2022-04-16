import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, Admin, Customer, Teacher } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, Customer, Teacher, Admin])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
