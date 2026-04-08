import { Module } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { CatalogModule } from './catalog/catalog.module';
import { DiscountsModule } from './discounts/discounts.module';
import { HealthModule } from './health/health.module';
import { InventoryModule } from './inventory/inventory.module';
import { PaymentsModule } from './payments/payments.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level:
          process.env.LOG_LEVEL ??
          (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
        genReqId: (req, res) => {
          const headerValue = req.headers['x-request-id'];
          const requestId =
            (Array.isArray(headerValue) ? headerValue[0] : headerValue) ??
            randomUUID();

          res.setHeader('x-request-id', requestId);
          return requestId;
        },
        customProps: () => ({
          service: process.env.APP_NAME ?? 'Aura-Core',
          environment: process.env.NODE_ENV ?? 'development',
        }),
        redact: ['req.headers.authorization', 'req.headers.cookie'],
        transport:
          process.env.NODE_ENV === 'production'
            ? undefined
            : {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                  translateTime: 'SYS:standard',
                },
              },
      },
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    CatalogModule,
    CartModule,
    DiscountsModule,
    InventoryModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
