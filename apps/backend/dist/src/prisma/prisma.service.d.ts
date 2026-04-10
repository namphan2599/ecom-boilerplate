import { INestApplication, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private isConnected;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    isReady(): boolean;
    getHealthStatus(): Promise<{
        status: 'up' | 'down';
        provider: 'prisma';
        detail: string;
        latencyMs?: number;
    }>;
    enableShutdownHooks(app: INestApplication): void;
}
