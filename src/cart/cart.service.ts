import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { createClient } from 'redis';
import type { AuthenticatedUser } from '../auth/auth.service';
import {
  CatalogService,
  type CatalogVariantSnapshot,
} from '../catalog/catalog.service';
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

@Injectable()
export class CartService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CartService.name);
  private readonly fallbackCarts = new Map<string, CartView>();
  private readonly cartTtlSeconds = Number(
    process.env.CART_TTL_SECONDS ?? 60 * 60 * 24 * 7,
  );
  private redisClient?: ReturnType<typeof createClient>;
  private redisReady = false;

  constructor(private readonly catalogService: CatalogService) {}

  async onModuleInit(): Promise<void> {
    if (!process.env.REDIS_URL) {
      this.logger.warn(
        'REDIS_URL is not set. Cart persistence is using in-memory fallback.',
      );
      return;
    }

    const client = createClient({
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
    } catch (error) {
      this.logger.warn(
        `Redis connection failed. Falling back to in-memory carts: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redisReady && this.redisClient) {
      await this.redisClient.quit();
    }
  }

  async getCartForUser(user: AuthenticatedUser): Promise<CartView> {
    return this.loadCart(user.userId, 'USD');
  }

  async addItem(
    user: AuthenticatedUser,
    input: AddCartItemDto,
  ): Promise<CartView> {
    const variant = await this.catalogService.resolveVariantSnapshot(
      input.sku,
      input.currencyCode ?? 'USD',
    );

    const cart = await this.loadCart(user.userId, variant.currencyCode);
    if (
      cart.items.length > 0 &&
      cart.summary.currencyCode !== variant.currencyCode
    ) {
      throw new ConflictException(
        'A cart can only contain items priced in a single currency at a time.',
      );
    }

    const existing = cart.items.find(
      (item) =>
        item.sku === variant.sku && item.currencyCode === variant.currencyCode,
    );

    if (existing) {
      existing.quantity += input.quantity;
      existing.lineTotal = this.roundCurrency(
        existing.quantity * existing.unitPrice,
      );
      existing.updatedAt = new Date().toISOString();
    } else {
      cart.items.push(this.toCartItemView(variant, input.quantity));
    }

    cart.summary = this.buildSummary(cart.items, variant.currencyCode);
    cart.updatedAt = new Date().toISOString();

    return this.persistCart(cart);
  }

  async updateItem(
    user: AuthenticatedUser,
    sku: string,
    input: UpdateCartItemDto,
  ): Promise<CartView> {
    const cart = await this.loadCart(user.userId, 'USD');
    const item = cart.items.find((candidate) => candidate.sku === sku);

    if (!item) {
      throw new NotFoundException(
        `Cart item with SKU \`${sku}\` was not found.`,
      );
    }

    if (input.quantity === 0) {
      cart.items = cart.items.filter((candidate) => candidate.sku !== sku);
    } else {
      item.quantity = input.quantity;
      item.lineTotal = this.roundCurrency(item.quantity * item.unitPrice);
      item.updatedAt = new Date().toISOString();
    }

    cart.summary = this.buildSummary(
      cart.items,
      cart.items[0]?.currencyCode ?? item.currencyCode,
    );
    cart.updatedAt = new Date().toISOString();

    return this.persistCart(cart);
  }

  async removeItem(user: AuthenticatedUser, sku: string): Promise<CartView> {
    const cart = await this.loadCart(user.userId, 'USD');
    const existingCount = cart.items.length;
    cart.items = cart.items.filter((candidate) => candidate.sku !== sku);

    if (existingCount === cart.items.length) {
      throw new NotFoundException(
        `Cart item with SKU \`${sku}\` was not found.`,
      );
    }

    cart.summary = this.buildSummary(
      cart.items,
      cart.items[0]?.currencyCode ?? cart.summary.currencyCode,
    );
    cart.updatedAt = new Date().toISOString();

    return this.persistCart(cart);
  }

  private async loadCart(
    userId: string,
    currencyCode: string,
  ): Promise<CartView> {
    if (this.redisReady && this.redisClient) {
      const raw = await this.redisClient.get(this.getCartKey(userId));

      if (raw) {
        return JSON.parse(raw) as CartView;
      }
    }

    return (
      this.fallbackCarts.get(this.getCartKey(userId)) ??
      this.createEmptyCart(userId, currencyCode)
    );
  }

  private async persistCart(cart: CartView): Promise<CartView> {
    cart.persistence = this.redisReady ? 'redis' : 'memory';

    if (this.redisReady && this.redisClient) {
      await this.redisClient.set(
        this.getCartKey(cart.userId),
        JSON.stringify(cart),
        {
          EX: this.cartTtlSeconds,
        },
      );

      return cart;
    }

    this.fallbackCarts.set(this.getCartKey(cart.userId), cart);
    return cart;
  }

  private createEmptyCart(userId: string, currencyCode: string): CartView {
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

  private buildSummary(
    items: CartItemView[],
    currencyCode: string,
  ): CartView['summary'] {
    return {
      currencyCode,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      distinctItems: items.length,
      subtotal: this.roundCurrency(
        items.reduce((total, item) => total + item.lineTotal, 0),
      ),
    };
  }

  private toCartItemView(
    variant: CatalogVariantSnapshot,
    quantity: number,
  ): CartItemView {
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

  private getCartKey(userId: string): string {
    return `aura-core:cart:${userId}`;
  }

  private roundCurrency(value: number): number {
    return Number(value.toFixed(2));
  }
}
