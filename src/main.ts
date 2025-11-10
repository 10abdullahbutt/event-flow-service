import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation pipe for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS for WebSocket connections
  app.enableCors();

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Event Flow Service API')
    .setDescription('Real-time Notification & Audit Pipeline - Event-driven service for user events')
    .setVersion('1.0')
    .addTag('events', 'Event publishing and management')
    .addTag('notifications', 'Notification management')
    .addTag('audit', 'Audit log management')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Event Flow Service listening on port ${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api`);
}
bootstrap();
