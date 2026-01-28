import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // Global validation pipe to validate DTOs automatically
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation configuration
  const config = new DocumentBuilder()
    .setTitle('Wizybot Chatbot API')
    .setDescription(
      'API for the Wizybot chatbot that can search products and convert currencies using OpenAI Function Calling',
    )
    .setVersion('1.0')
    .addTag('chatbot', 'Chatbot endpoints for user queries')
    .build();

  const document = SwaggerModule.createDocument(app as any, config);
  SwaggerModule.setup('api', app as any, document); // Swagger UI available at /api

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Application -> http://localhost:${port}`);
  console.log(`Swagger docs available at: http://localhost:${port}/api`);
}

bootstrap().catch((err) => console.error(err));
