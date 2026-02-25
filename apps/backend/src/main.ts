import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ClassSerializerInterceptor, Logger } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { TransformResponseInterceptor } from './app/interceptors/transform-response.interceptors';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import multipart from '@fastify/multipart';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

async function bootstrap(): Promise<NestFastifyApplication> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      bodyLimit: 10 * 1024 * 1024, // 10 MB
    }),
    {
      cors: {
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
      },
      logger: ['debug', 'error', 'log', 'warn', 'verbose'],
    },
  );

  await app.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5 MB
    },
  });

  app.setGlobalPrefix('api');
  app.enableVersioning({
    defaultVersion: '1',
    prefix: 'v',
    type: 0,
  });

  const reflector = app.get(Reflector);

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(reflector),
    new TransformResponseInterceptor(),
  );

  // Load OpenAPI YAML specification
  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';

  // Setup Swagger
  const openApiPath = path.join(__dirname, 'swagger', 'openapi.yaml');
  let document;

  if (fs.existsSync(openApiPath)) {
    // Load from YAML file
    const yamlContent = fs.readFileSync(openApiPath, 'utf8');
    document = yaml.parse(yamlContent);
  } else {
    // Fallback to DocumentBuilder if YAML not found
    const config = new DocumentBuilder()
      .setTitle('Presentation Builder API')
      .setDescription('API for managing presentations, projects, and slides')
      .setVersion('1.0.0')
      .addServer('/api/v1', 'API v1')
      .build();
    document = SwaggerModule.createDocument(app, config);
  }

  // Serve Swagger UI at /api/docs
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'Presentation Builder API Docs',
  });

  // Also serve raw OpenAPI JSON at /api/docs-json
  Logger.log(`📚 Swagger documentation available at /api/docs`);

  const port = configService.get<number>('PORT') || 3000;
  const host = configService.get<string>('HOST') || 'localhost';
  await app.listen(port, host);

  Logger.log(`🚀 Application is running on: http://${host}:${port}/api`);

  return app;
}

bootstrap();
