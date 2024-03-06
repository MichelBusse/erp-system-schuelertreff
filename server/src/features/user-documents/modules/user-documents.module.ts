import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UserDocumentsService } from '../services/user-documents.service'
import { UserDocumentsController } from '../controllers/user-documents.controller'
import { UsersModule } from 'src/features/users/modules/users.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Document]),
    forwardRef(() => UsersModule),
  ],
  providers: [UserDocumentsService],
  controllers: [UserDocumentsController],
  exports: [UserDocumentsService],
})
export class UserDocumentsModule {}
