import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UsersModule } from 'src/users/users.module'

import { Contract } from './contract.entity'
import { ContractsController } from './contracts.controller'
import { ContractsService } from './contracts.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Contract]),
    forwardRef(() => UsersModule),
  ],
  providers: [ContractsService],
  controllers: [ContractsController],
  exports: [ContractsService],
})
export class ContractsModule {}
