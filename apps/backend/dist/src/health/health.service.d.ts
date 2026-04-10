import { CartService } from '../cart/cart.service';
import { PrismaService } from '../prisma/prisma.service';
export type HealthOverallStatus = 'ok' | 'degraded' | 'error';
export declare class HealthService {
    private readonly prismaService;
    private readonly cartService;
    constructor(prismaService: PrismaService, cartService: CartService);
    getLiveness(): {
        service: string;
        version: string;
        environment: string;
        status: HealthOverallStatus;
        timestamp: string;
        uptimeSeconds: number;
    };
    getReadiness(): Promise<{
        checks: {
            database: {
                status: "up" | "down";
                provider: "prisma";
                detail: string;
                latencyMs?: number;
            };
            cache: {
                status: "up" | "degraded";
                provider: "redis" | "memory";
                detail: string;
                ttlSeconds: number;
                latencyMs?: number;
            };
            runtime: {
                status: "up";
                nodeVersion: string;
                rssMb: number;
                heapUsedMb: number;
                heapTotalMb: number;
            };
        };
        strictChecks: boolean;
        service: string;
        version: string;
        environment: string;
        status: HealthOverallStatus;
        timestamp: string;
        uptimeSeconds: number;
        httpStatus: number;
    }>;
    private buildBasePayload;
    private getRuntimeHealth;
    private toMegabytes;
}
