import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Important for the DTO validation to work!
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  
  app.enableCors();
  app.setGlobalPrefix('api/v1');
  
  await app.listen(4000);
}
bootstrap();