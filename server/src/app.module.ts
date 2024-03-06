import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { JwtAuthGuard } from './features/auth/guards/jwt-auth.guard'
import { RolesGuard } from './features/auth/guards/roles.guard'
import { UsersModule } from './features/users/modules/users.module'
import { SubjectsModule } from './features/subjects/modules/subjects.module'
import { LessonsModule } from './features/lessons/modules/lessons.module'
import { ContractsModule } from './features/contracts/modules/contracts.module'
import { AuthModule } from './features/auth/modules/auth.module'
import { UserDocumentsModule } from './features/user-documents/modules/user-documents.module'

const ENV = process.env.NODE_ENV

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: 5432,
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASS'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        // can cause data loss, disable in production
        synchronize: ENV !== 'production',
      }),
      inject: [ConfigService],
    }),
    SubjectsModule,
    LessonsModule,
    ContractsModule,
    UsersModule,
    AuthModule,
    UserDocumentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
