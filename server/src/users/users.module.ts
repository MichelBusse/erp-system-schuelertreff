import { forwardRef, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthModule } from 'src/auth/auth.module'
import { DocumentsModule } from 'src/documents/documents.module'
import { LessonsModule } from 'src/lessons/lessons.module'

import {
  Admin,
  ClassCustomer,
  Customer,
  PrivateCustomer,
  School,
  Teacher,
  User,
} from './entities'
import { Leave } from './entities/leave.entity'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Customer,
      PrivateCustomer,
      School,
      Teacher,
      Admin,
      ClassCustomer,
      Leave,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => LessonsModule),
    forwardRef(() => DocumentsModule),
    ConfigModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
