import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get<ConfigService>(ConfigService);

  app.enableCors({
    origin: config.get<string>('CLIENT_ORIGIN'),
    credentials: true,
  });

  await app.listen(8080);

  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
