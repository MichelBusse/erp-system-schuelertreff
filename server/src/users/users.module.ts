import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthModule } from 'src/auth/auth.module'

import {
  Admin,
  Customer,
  PrivateCustomer,
  SchoolCustomer,
  Teacher,
  User,
  ClassCustomer,
} from './entities'

import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Customer,
      PrivateCustomer,
      SchoolCustomer,
      Teacher,
      Admin,
      ClassCustomer,
    ]),
    forwardRef(() => AuthModule),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
