import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security Headers using Helmet
  app.use(helmet({
    contentSecurityPolicy: false, // Turn off CSP for development and Swagger
  }));

  // Enable CORS
  app.enableCors({
    origin: true, // Allow all origins in development
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // Global Validation Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Setup Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('CaelumOS AI API Gateway')
    .setDescription('Production-ready API endpoints for CaelumOS Web operating system')
    .setVersion('2.1')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`CaelumOS Backend initialized on port ${port}`);
  console.log(`Swagger Documentation available at http://localhost:${port}/api-docs`);
}
bootstrap();
