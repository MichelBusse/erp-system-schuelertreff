import { forwardRef, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../entities/user.entity'
import { Customer } from '../entities/customer.entity'
import { PrivateCustomer } from '../entities/privateCustomer.entity'
import { School } from '../entities/school.entity'
import { Teacher } from '../entities/teacher.entity'
import { Admin } from '../entities/Admin.entity'
import { ClassCustomer } from '../entities/classCustomer.entity'
import { AuthModule } from 'src/features/auth/modules/auth.module'
import { LessonsModule } from 'src/features/lessons/modules/lessons.module'
import { UserDocumentsModule } from 'src/features/user-documents/modules/user-documents.module'
import { UsersService } from '../services/users.service'
import { UsersController } from '../controllers/users.controller'
import { Leave } from '../entities/Leave'

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
    forwardRef(() => UserDocumentsModule),
    ConfigModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
