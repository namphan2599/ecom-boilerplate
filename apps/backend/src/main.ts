import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });

  app.enableShutdownHooks();
  app.useLogger(app.get(Logger));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());

  const prismaService = app.get(PrismaService);
  prismaService.enableShutdownHooks(app);

  const apiPrefix = process.env.API_PREFIX ?? 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Aura-Core API')
    .setDescription(
      'Production-ready modular monolith e-commerce boilerplate with documented public, admin, cart, checkout, and order-management APIs.',
    )
    .setVersion('1.0.0')
    .addServer('/api/v1', 'Versioned API base path')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  const baseUrl = `http://localhost:${port}/${apiPrefix}`;
  app.get(Logger).log(`Aura-Core API running on ${baseUrl}`);
  app
    .get(Logger)
    .log(`Swagger docs available at http://localhost:${port}/api/docs`);
  app
    .get(Logger)
    .log(
      `Health probes available at ${baseUrl}/health/live and ${baseUrl}/health/ready`,
    );
}
void bootstrap();
