import {
  INestApplication,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private isConnected = false;

  async onModuleInit(): Promise<void> {
    if (!process.env.DATABASE_URL) {
      this.logger.warn(
        'DATABASE_URL is not set. Prisma connection is skipped for this runtime.',
      );
      return;
    }

    try {
      await this.$connect();
      this.isConnected = true;
    } catch (error) {
      this.logger.warn(
        `Prisma connection failed. Falling back to non-database mode: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      this.isConnected = false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    await this.$disconnect();
  }

  isReady(): boolean {
    return this.isConnected;
  }

  enableShutdownHooks(app: INestApplication): void {
    process.on('beforeExit', () => {
      void app.close();
    });
  }
}
