import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setUpDb } from './data-source';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  await setUpDb();

  await app.listen(3000);
}
bootstrap();
