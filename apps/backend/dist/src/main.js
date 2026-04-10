"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const nestjs_pino_1 = require("nestjs-pino");
const app_module_1 = require("./app.module");
const global_exception_filter_1 = require("./common/filters/global-exception.filter");
const prisma_service_1 = require("./prisma/prisma.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bufferLogs: true,
        rawBody: true,
    });
    app.enableShutdownHooks();
    app.useLogger(app.get(nestjs_pino_1.Logger));
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
    const prismaService = app.get(prisma_service_1.PrismaService);
    prismaService.enableShutdownHooks(app);
    const apiPrefix = process.env.API_PREFIX ?? 'api/v1';
    app.setGlobalPrefix(apiPrefix);
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('Aura-Core API')
        .setDescription('Production-ready modular monolith e-commerce boilerplate with documented public, admin, cart, checkout, and order-management APIs.')
        .setVersion('1.0.0')
        .addServer('/api/v1', 'Versioned API base path')
        .addBearerAuth()
        .build();
    const swaggerDocument = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, swaggerDocument, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    const baseUrl = `http://localhost:${port}/${apiPrefix}`;
    app.get(nestjs_pino_1.Logger).log(`Aura-Core API running on ${baseUrl}`);
    app
        .get(nestjs_pino_1.Logger)
        .log(`Swagger docs available at http://localhost:${port}/api/docs`);
    app
        .get(nestjs_pino_1.Logger)
        .log(`Health probes available at ${baseUrl}/health/live and ${baseUrl}/health/ready`);
}
void bootstrap();
//# sourceMappingURL=main.js.map