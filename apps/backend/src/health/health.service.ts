import { Injectable } from '@nestjs/common';
import { CartService } from '../cart/cart.service';
import { PrismaService } from '../prisma/prisma.service';

export type HealthOverallStatus = 'ok' | 'degraded' | 'error';

@Injectable()
export class HealthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cartService: CartService,
  ) {}

  getLiveness() {
    return this.buildBasePayload('ok');
  }

  async getReadiness() {
    const [database, cache] = await Promise.all([
      this.prismaService.getHealthStatus(),
      this.cartService.getPersistenceHealth(),
    ]);

    const strictChecks =
      process.env.STRICT_HEALTH_CHECKS === 'true' ||
      process.env.NODE_ENV === 'production';
    const allCriticalDependenciesReady =
      database.status === 'up' && cache.status === 'up';

    const status: HealthOverallStatus = allCriticalDependenciesReady
      ? 'ok'
      : strictChecks
        ? 'error'
        : 'degraded';

    return {
      httpStatus: status === 'error' ? 503 : 200,
      ...this.buildBasePayload(status),
      checks: {
        database,
        cache,
        runtime: this.getRuntimeHealth(),
      },
      strictChecks,
    };
  }

  private buildBasePayload(status: HealthOverallStatus) {
    return {
      service: process.env.APP_NAME ?? 'Aura-Core',
      version:
        process.env.APP_VERSION ?? process.env.npm_package_version ?? '0.0.1',
      environment: process.env.NODE_ENV ?? 'development',
      status,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Number(process.uptime().toFixed(2)),
    };
  }

  private getRuntimeHealth() {
    const memoryUsage = process.memoryUsage();

    return {
      status: 'up' as const,
      nodeVersion: process.version,
      rssMb: this.toMegabytes(memoryUsage.rss),
      heapUsedMb: this.toMegabytes(memoryUsage.heapUsed),
      heapTotalMb: this.toMegabytes(memoryUsage.heapTotal),
    };
  }

  private toMegabytes(value: number): number {
    return Number((value / 1024 / 1024).toFixed(2));
  }
}
