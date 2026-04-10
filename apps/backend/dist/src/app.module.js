"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const nestjs_pino_1 = require("nestjs-pino");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const cart_module_1 = require("./cart/cart.module");
const catalog_module_1 = require("./catalog/catalog.module");
const discounts_module_1 = require("./discounts/discounts.module");
const health_module_1 = require("./health/health.module");
const inventory_module_1 = require("./inventory/inventory.module");
const payments_module_1 = require("./payments/payments.module");
const prisma_module_1 = require("./prisma/prisma.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            nestjs_pino_1.LoggerModule.forRoot({
                pinoHttp: {
                    level: process.env.LOG_LEVEL ??
                        (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
                    genReqId: (req, res) => {
                        const headerValue = req.headers['x-request-id'];
                        const requestId = (Array.isArray(headerValue) ? headerValue[0] : headerValue) ??
                            (0, node_crypto_1.randomUUID)();
                        res.setHeader('x-request-id', requestId);
                        return requestId;
                    },
                    customProps: () => ({
                        service: process.env.APP_NAME ?? 'Aura-Core',
                        environment: process.env.NODE_ENV ?? 'development',
                    }),
                    redact: ['req.headers.authorization', 'req.headers.cookie'],
                    transport: process.env.NODE_ENV === 'production'
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
            prisma_module_1.PrismaModule,
            health_module_1.HealthModule,
            auth_module_1.AuthModule,
            catalog_module_1.CatalogModule,
            cart_module_1.CartModule,
            discounts_module_1.DiscountsModule,
            inventory_module_1.InventoryModule,
            payments_module_1.PaymentsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map