"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthService = void 0;
const common_1 = require("@nestjs/common");
const cart_service_1 = require("../cart/cart.service");
const prisma_service_1 = require("../prisma/prisma.service");
let HealthService = class HealthService {
    prismaService;
    cartService;
    constructor(prismaService, cartService) {
        this.prismaService = prismaService;
        this.cartService = cartService;
    }
    getLiveness() {
        return this.buildBasePayload('ok');
    }
    async getReadiness() {
        const [database, cache] = await Promise.all([
            this.prismaService.getHealthStatus(),
            this.cartService.getPersistenceHealth(),
        ]);
        const strictChecks = process.env.STRICT_HEALTH_CHECKS === 'true' ||
            process.env.NODE_ENV === 'production';
        const allCriticalDependenciesReady = database.status === 'up' && cache.status === 'up';
        const status = allCriticalDependenciesReady
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
    buildBasePayload(status) {
        return {
            service: process.env.APP_NAME ?? 'Aura-Core',
            version: process.env.APP_VERSION ?? process.env.npm_package_version ?? '0.0.1',
            environment: process.env.NODE_ENV ?? 'development',
            status,
            timestamp: new Date().toISOString(),
            uptimeSeconds: Number(process.uptime().toFixed(2)),
        };
    }
    getRuntimeHealth() {
        const memoryUsage = process.memoryUsage();
        return {
            status: 'up',
            nodeVersion: process.version,
            rssMb: this.toMegabytes(memoryUsage.rss),
            heapUsedMb: this.toMegabytes(memoryUsage.heapUsed),
            heapTotalMb: this.toMegabytes(memoryUsage.heapTotal),
        };
    }
    toMegabytes(value) {
        return Number((value / 1024 / 1024).toFixed(2));
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cart_service_1.CartService])
], HealthService);
//# sourceMappingURL=health.service.js.map