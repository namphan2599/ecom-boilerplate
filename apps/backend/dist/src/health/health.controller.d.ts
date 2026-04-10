import type { Response } from 'express';
import { HealthService } from './health.service';
export declare class HealthController {
    private readonly healthService;
    constructor(healthService: HealthService);
    getHealth(response: Response): Promise<{
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
        status: import("./health.service").HealthOverallStatus;
        timestamp: string;
        uptimeSeconds: number;
    }>;
    getLiveness(): {
        service: string;
        version: string;
        environment: string;
        status: import("./health.service").HealthOverallStatus;
        timestamp: string;
        uptimeSeconds: number;
    };
    getReadiness(response: Response): Promise<{
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
        status: import("./health.service").HealthOverallStatus;
        timestamp: string;
        uptimeSeconds: number;
    }>;
}
