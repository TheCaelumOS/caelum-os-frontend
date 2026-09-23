import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Private Network Access (PNA) & Cross-Origin Middleware
  // Allows web browsers on https://caleum.me to connect to the local backend daemon
  app.use((req: any, res: any, next: any) => {
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
      res.setHeader(
        'Access-Control-Allow-Headers',
        req.headers['access-control-request-headers'] || 'Content-Type, Authorization, Access-Control-Request-Private-Network'
      );
      return res.sendStatus(204);
    }
    next();
  });

  // Security Headers using Helmet
  app.use(helmet({
    contentSecurityPolicy: false, // Turn off CSP for development and Swagger
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  // Enable CORS
  app.enableCors({
    origin: (origin, callback) => {
      // Allow all origins (caleum.me, localhost, etc.)
      callback(null, true);
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Request-Private-Network'],
    exposedHeaders: ['Access-Control-Allow-Private-Network'],
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
