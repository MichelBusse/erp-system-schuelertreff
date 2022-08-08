import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import BodyParser from 'body-parser'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.use(BodyParser.json({ limit: '50mb' }))
  app.use(BodyParser.urlencoded({ limit: '50mb', extended: true }))

  const config = app.get<ConfigService>(ConfigService)

  app.enableCors({
    origin: config.get<string>('CLIENT_ORIGIN'),
    credentials: true,
  })

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  await app.listen(8080)

  console.log(`Application is running on: ${await app.getUrl()}`)
}

bootstrap()
