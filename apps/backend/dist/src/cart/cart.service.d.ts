import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.service';
import { CatalogService } from '../catalog/catalog.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
export interface CartItemView {
    productId: string;
    variantId: string;
    sku: string;
    productName: string;
    variantName: string;
    attributes: Record<string, string>;
    currencyCode: string;
    unitPrice: number;
    compareAtAmount?: number | null;
    quantity: number;
    lineTotal: number;
    addedAt: string;
    updatedAt: string;
}
export interface CartView {
    userId: string;
    items: CartItemView[];
    summary: {
        currencyCode: string;
        itemCount: number;
        distinctItems: number;
        subtotal: number;
    };
    persistence: 'redis' | 'memory';
    updatedAt: string;
}
export declare class CartService implements OnModuleInit, OnModuleDestroy {
    private readonly catalogService;
    private readonly logger;
    private readonly fallbackCarts;
    private readonly cartTtlSeconds;
    private redisClient?;
    private redisReady;
    constructor(catalogService: CatalogService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    getCartForUser(user: AuthenticatedUser): Promise<CartView>;
    addItem(user: AuthenticatedUser, input: AddCartItemDto): Promise<CartView>;
    updateItem(user: AuthenticatedUser, sku: string, input: UpdateCartItemDto): Promise<CartView>;
    removeItem(user: AuthenticatedUser, sku: string): Promise<CartView>;
    getPersistenceHealth(): Promise<{
        status: 'up' | 'degraded';
        provider: 'redis' | 'memory';
        detail: string;
        ttlSeconds: number;
        latencyMs?: number;
    }>;
    private loadCart;
    private persistCart;
    private createEmptyCart;
    private buildSummary;
    private toCartItemView;
    private getCartKey;
    private roundCurrency;
}
