"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    logger = new common_1.Logger(PrismaService_1.name);
    isConnected = false;
    async onModuleInit() {
        if (!process.env.DATABASE_URL) {
            this.logger.warn('DATABASE_URL is not set. Prisma connection is skipped for this runtime.');
            return;
        }
        try {
            await this.$connect();
            this.isConnected = true;
        }
        catch (error) {
            this.logger.warn(`Prisma connection failed. Falling back to non-database mode: ${error instanceof Error ? error.message : 'unknown error'}`);
            this.isConnected = false;
        }
    }
    async onModuleDestroy() {
        if (!this.isConnected) {
            return;
        }
        await this.$disconnect();
    }
    isReady() {
        return this.isConnected;
    }
    async getHealthStatus() {
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
            await this.$queryRaw `SELECT 1`;
            return {
                status: 'up',
                provider: 'prisma',
                detail: 'Database connection is healthy.',
                latencyMs: Date.now() - startedAt,
            };
        }
        catch (error) {
            return {
                status: 'down',
                provider: 'prisma',
                detail: `Database health probe failed: ${error instanceof Error ? error.message : 'unknown error'}`,
            };
        }
    }
    enableShutdownHooks(app) {
        process.on('beforeExit', () => {
            void app.close();
        });
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)()
], PrismaService);
//# sourceMappingURL=prisma.service.js.map