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
var CartService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const redis_1 = require("redis");
const catalog_service_1 = require("../catalog/catalog.service");
let CartService = CartService_1 = class CartService {
    catalogService;
    logger = new common_1.Logger(CartService_1.name);
    fallbackCarts = new Map();
    cartTtlSeconds = Number(process.env.CART_TTL_SECONDS ?? 60 * 60 * 24 * 7);
    redisClient;
    redisReady = false;
    constructor(catalogService) {
        this.catalogService = catalogService;
    }
    async onModuleInit() {
        if (!process.env.REDIS_URL) {
            this.logger.warn('REDIS_URL is not set. Cart persistence is using in-memory fallback.');
            return;
        }
        const client = (0, redis_1.createClient)({
            url: process.env.REDIS_URL,
            socket: {
                connectTimeout: 500,
                reconnectStrategy: false,
            },
        });
        client.on('error', (error) => {
            const message = error instanceof Error ? error.message : 'unknown error';
            this.logger.warn(`Redis client error: ${message}`);
        });
        try {
            await client.connect();
            this.redisClient = client;
            this.redisReady = true;
        }
        catch (error) {
            this.logger.warn(`Redis connection failed. Falling back to in-memory carts: ${error instanceof Error ? error.message : 'unknown error'}`);
        }
    }
    async onModuleDestroy() {
        if (this.redisReady && this.redisClient) {
            await this.redisClient.quit();
        }
    }
    async getCartForUser(user) {
        return this.loadCart(user.userId, 'USD');
    }
    async addItem(user, input) {
        const variant = await this.catalogService.resolveVariantSnapshot(input.sku, input.currencyCode ?? 'USD');
        const cart = await this.loadCart(user.userId, variant.currencyCode);
        if (cart.items.length > 0 &&
            cart.summary.currencyCode !== variant.currencyCode) {
            throw new common_1.ConflictException('A cart can only contain items priced in a single currency at a time.');
        }
        const existing = cart.items.find((item) => item.sku === variant.sku && item.currencyCode === variant.currencyCode);
        if (existing) {
            existing.quantity += input.quantity;
            existing.lineTotal = this.roundCurrency(existing.quantity * existing.unitPrice);
            existing.updatedAt = new Date().toISOString();
        }
        else {
            cart.items.push(this.toCartItemView(variant, input.quantity));
        }
        cart.summary = this.buildSummary(cart.items, variant.currencyCode);
        cart.updatedAt = new Date().toISOString();
        return this.persistCart(cart);
    }
    async updateItem(user, sku, input) {
        const cart = await this.loadCart(user.userId, 'USD');
        const item = cart.items.find((candidate) => candidate.sku === sku);
        if (!item) {
            throw new common_1.NotFoundException(`Cart item with SKU \`${sku}\` was not found.`);
        }
        if (input.quantity === 0) {
            cart.items = cart.items.filter((candidate) => candidate.sku !== sku);
        }
        else {
            item.quantity = input.quantity;
            item.lineTotal = this.roundCurrency(item.quantity * item.unitPrice);
            item.updatedAt = new Date().toISOString();
        }
        cart.summary = this.buildSummary(cart.items, cart.items[0]?.currencyCode ?? item.currencyCode);
        cart.updatedAt = new Date().toISOString();
        return this.persistCart(cart);
    }
    async removeItem(user, sku) {
        const cart = await this.loadCart(user.userId, 'USD');
        const existingCount = cart.items.length;
        cart.items = cart.items.filter((candidate) => candidate.sku !== sku);
        if (existingCount === cart.items.length) {
            throw new common_1.NotFoundException(`Cart item with SKU \`${sku}\` was not found.`);
        }
        cart.summary = this.buildSummary(cart.items, cart.items[0]?.currencyCode ?? cart.summary.currencyCode);
        cart.updatedAt = new Date().toISOString();
        return this.persistCart(cart);
    }
    async getPersistenceHealth() {
        if (this.redisReady && this.redisClient) {
            const startedAt = Date.now();
            try {
                await this.redisClient.ping();
                return {
                    status: 'up',
                    provider: 'redis',
                    detail: 'Redis cart persistence is connected and responding.',
                    ttlSeconds: this.cartTtlSeconds,
                    latencyMs: Date.now() - startedAt,
                };
            }
            catch (error) {
                this.logger.warn(`Redis ping failed during health check: ${error instanceof Error ? error.message : 'unknown error'}`);
            }
        }
        return {
            status: 'degraded',
            provider: 'memory',
            detail: process.env.REDIS_URL
                ? 'Redis is unavailable; in-memory cart persistence fallback is active.'
                : 'REDIS_URL is not configured; in-memory cart persistence fallback is active.',
            ttlSeconds: this.cartTtlSeconds,
        };
    }
    async loadCart(userId, currencyCode) {
        if (this.redisReady && this.redisClient) {
            const raw = await this.redisClient.get(this.getCartKey(userId));
            if (raw) {
                return JSON.parse(raw);
            }
        }
        return (this.fallbackCarts.get(this.getCartKey(userId)) ??
            this.createEmptyCart(userId, currencyCode));
    }
    async persistCart(cart) {
        cart.persistence = this.redisReady ? 'redis' : 'memory';
        if (this.redisReady && this.redisClient) {
            await this.redisClient.set(this.getCartKey(cart.userId), JSON.stringify(cart), {
                EX: this.cartTtlSeconds,
            });
            return cart;
        }
        this.fallbackCarts.set(this.getCartKey(cart.userId), cart);
        return cart;
    }
    createEmptyCart(userId, currencyCode) {
        return {
            userId,
            items: [],
            summary: {
                currencyCode,
                itemCount: 0,
                distinctItems: 0,
                subtotal: 0,
            },
            persistence: this.redisReady ? 'redis' : 'memory',
            updatedAt: new Date().toISOString(),
        };
    }
    buildSummary(items, currencyCode) {
        return {
            currencyCode,
            itemCount: items.reduce((total, item) => total + item.quantity, 0),
            distinctItems: items.length,
            subtotal: this.roundCurrency(items.reduce((total, item) => total + item.lineTotal, 0)),
        };
    }
    toCartItemView(variant, quantity) {
        const timestamp = new Date().toISOString();
        return {
            productId: variant.productId,
            variantId: variant.variantId,
            sku: variant.sku,
            productName: variant.productName,
            variantName: variant.variantName,
            attributes: variant.attributes,
            currencyCode: variant.currencyCode,
            unitPrice: variant.unitPrice,
            compareAtAmount: variant.compareAtAmount ?? null,
            quantity,
            lineTotal: this.roundCurrency(variant.unitPrice * quantity),
            addedAt: timestamp,
            updatedAt: timestamp,
        };
    }
    getCartKey(userId) {
        return `aura-core:cart:${userId}`;
    }
    roundCurrency(value) {
        return Number(value.toFixed(2));
    }
};
exports.CartService = CartService;
exports.CartService = CartService = CartService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [catalog_service_1.CatalogService])
], CartService);
//# sourceMappingURL=cart.service.js.map