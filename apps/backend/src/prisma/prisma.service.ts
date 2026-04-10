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

  async getHealthStatus(): Promise<{
    status: 'up' | 'down';
    provider: 'prisma';
    detail: string;
    latencyMs?: number;
  }> {
    if (!process.env.DATABASE_URL) {
      return {
        status: 'down',
        provider: 'prisma',
        detail: 'DATABASE_URL is not configured; running in fallback mode.',
      };
    }

    if (!this.isConnected) {
      return {
        status: 'down',
        provider: 'prisma',
        detail: 'Prisma is not connected to the configured database.',
      };
    }

    const startedAt = Date.now();

    try {
      await this.$queryRaw`SELECT 1`;

      return {
        status: 'up',
        provider: 'prisma',
        detail: 'Database connection is healthy.',
        latencyMs: Date.now() - startedAt,
      };
    } catch (error) {
      return {
        status: 'down',
        provider: 'prisma',
        detail: `Database health probe failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      };
    }
  }

  enableShutdownHooks(app: INestApplication): void {
    process.on('beforeExit', () => {
      void app.close();
    });
  }
}
