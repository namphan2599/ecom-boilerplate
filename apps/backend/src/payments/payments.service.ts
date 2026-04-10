import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import type { AuthenticatedUser } from '../auth/auth.service';
import { type CartView } from '../cart/cart.service';
import { CatalogService } from '../catalog/catalog.service';
import { DiscountsService } from '../discounts/discounts.service';
import { InventoryService } from '../inventory/inventory.service';

export interface StripeLikeEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}

export interface CreateCheckoutSessionInput {
  customer: AuthenticatedUser;
  cart: CartView;
  couponCode?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutOrderView {
  orderNumber: string;
  checkoutToken: string;
  userId: string;
  customerEmail: string;
  customerName?: string;
  status: OrderStatus;
  paymentStatus: 'requires_payment' | 'paid' | 'failed';
  currencyCode: string;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingTotal: number;
  grandTotal: number;
  couponCode?: string;
  stripeCheckoutSessionId: string;
  stripePaymentIntentId?: string;
  items: CartView['items'];
  createdAt: string;
  updatedAt: string;
}

export interface HostedCheckoutSessionView {
  provider: 'stripe' | 'mock-stripe';
  checkoutToken: string;
  sessionId: string;
  checkoutUrl: string;
  successUrl: string;
  cancelUrl: string;
  expiresAt: string;
  order: CheckoutOrderView;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly processedEventIds = new Set<string>();
  private readonly fallbackOrders = new Map<string, CheckoutOrderView>();
  private readonly sessionIndex = new Map<string, string>();
  private orderSequence = 0;

  constructor(
    private readonly inventoryService: InventoryService,
    private readonly discountsService: DiscountsService,
    private readonly catalogService?: CatalogService,
  ) {}

  async createCheckoutSession(
    input: CreateCheckoutSessionInput,
  ): Promise<HostedCheckoutSessionView> {
    if (input.cart.items.length === 0) {
      throw new BadRequestException(
        'Cannot create a checkout session for an empty cart.',
      );
    }

    const currencyCode = input.cart.summary.currencyCode.toUpperCase();
    const mixedCurrency = input.cart.items.some(
      (item) => item.currencyCode.toUpperCase() !== currencyCode,
    );

    if (mixedCurrency) {
      throw new BadRequestException(
        'All checkout items must share the same currency.',
      );
    }

    const couponApplication = input.couponCode
      ? await this.discountsService.validateAndApplyCoupon({
          code: input.couponCode,
          subtotal: input.cart.summary.subtotal,
          currencyCode,
        })
      : null;

    const checkoutToken = `chk_${randomUUID().replace(/-/g, '')}`;

    try {
      for (const item of input.cart.items) {
        await this.ensureInventorySeeded(item.sku, item.currencyCode);
        this.inventoryService.reserveStock({
          checkoutToken,
          sku: item.sku,
          quantity: item.quantity,
        });
      }

      if (couponApplication) {
        await this.discountsService.markCouponUsed(
          couponApplication.coupon.code,
        );
      }
    } catch (error) {
      try {
        this.inventoryService.releaseReservation(checkoutToken);
      } catch {
        // noop rollback guard
      }

      if (couponApplication) {
        await this.discountsService
          .releaseCouponUsage(couponApplication.coupon.code)
          .catch(() => undefined);
      }

      throw error;
    }

    const sessionId = `cs_test_${randomUUID().replace(/-/g, '').slice(0, 24)}`;
    const subtotal = this.roundCurrency(input.cart.summary.subtotal);
    const discountTotal = this.roundCurrency(
      couponApplication?.discountAmount ?? 0,
    );
    const taxableSubtotal = this.roundCurrency(
      Math.max(subtotal - discountTotal, 0),
    );
    const shippingTotal = this.roundCurrency(taxableSubtotal >= 100 ? 0 : 9.99);
    const taxTotal = this.roundCurrency(taxableSubtotal * 0.08);
    const grandTotal = this.roundCurrency(
      taxableSubtotal + shippingTotal + taxTotal,
    );
    const timestamp = new Date().toISOString();

    const order: CheckoutOrderView = {
      orderNumber: this.nextOrderNumber(),
      checkoutToken,
      userId: input.customer.userId,
      customerEmail: input.customer.email,
      customerName: input.customer.displayName,
      status: OrderStatus.PENDING,
      paymentStatus: 'requires_payment',
      currencyCode,
      subtotal,
      discountTotal,
      taxTotal,
      shippingTotal,
      grandTotal,
      couponCode: couponApplication?.coupon.code,
      stripeCheckoutSessionId: sessionId,
      items: input.cart.items.map((item) => ({ ...item })),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.fallbackOrders.set(checkoutToken, order);
    this.sessionIndex.set(sessionId, checkoutToken);

    const successUrl =
      input.successUrl ??
      process.env.CHECKOUT_SUCCESS_URL ??
      'https://storefront.aura.local/checkout/success';
    const cancelUrl =
      input.cancelUrl ??
      process.env.CHECKOUT_CANCEL_URL ??
      'https://storefront.aura.local/checkout/cancel';

    return {
      provider: process.env.STRIPE_SECRET_KEY ? 'stripe' : 'mock-stripe',
      checkoutToken,
      sessionId,
      checkoutUrl: `https://checkout.stripe.com/c/pay/${sessionId}`,
      successUrl,
      cancelUrl,
      expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
      order,
    };
  }

  listOrdersForUser(userId: string): {
    items: CheckoutOrderView[];
    total: number;
  } {
    const items = [...this.fallbackOrders.values()]
      .filter((order) => order.userId === userId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

    return {
      items,
      total: items.length,
    };
  }

  listAllOrders(): { items: CheckoutOrderView[]; total: number } {
    const items = [...this.fallbackOrders.values()].sort((left, right) =>
      right.createdAt.localeCompare(left.createdAt),
    );

    return {
      items,
      total: items.length,
    };
  }

  updateOrderStatus(
    orderNumber: string,
    status: OrderStatus,
  ): CheckoutOrderView {
    const order = [...this.fallbackOrders.values()].find(
      (candidate) => candidate.orderNumber === orderNumber,
    );

    if (!order) {
      throw new NotFoundException(
        `Order with number \`${orderNumber}\` was not found.`,
      );
    }

    if (order.status === status) {
      return order;
    }

    this.assertStatusTransition(order.status, status);

    order.status = status;
    order.updatedAt = new Date().toISOString();

    if (
      status === OrderStatus.PAID ||
      status === OrderStatus.SHIPPED ||
      status === OrderStatus.DELIVERED
    ) {
      order.paymentStatus = 'paid';
    }

    if (status === OrderStatus.CANCELLED) {
      order.paymentStatus = 'failed';
    }

    if (status === OrderStatus.REFUNDED) {
      order.paymentStatus = 'failed';
    }

    return order;
  }

  getOrderByCheckoutToken(checkoutToken: string): CheckoutOrderView {
    const order = this.fallbackOrders.get(checkoutToken);

    if (!order) {
      throw new NotFoundException(
        `No checkout order found for token \`${checkoutToken}\`.`,
      );
    }

    return order;
  }

  /**
   * Replace this lightweight validation with stripe.webhooks.constructEvent()
   * once the Stripe SDK and webhook secret are wired into the project.
   */
  parseAndVerifyWebhook(input: {
    signature?: string;
    payload: unknown;
  }): StripeLikeEvent {
    if (!input.signature) {
      throw new BadRequestException('Missing Stripe signature header.');
    }

    if (!this.isStripeLikeEvent(input.payload)) {
      throw new BadRequestException('Invalid Stripe webhook payload.');
    }

    return input.payload;
  }

  async handleWebhookEvent(
    event: StripeLikeEvent,
  ): Promise<CheckoutOrderView | void> {
    if (this.processedEventIds.has(event.id)) {
      this.logger.warn(`Ignoring duplicate Stripe event ${event.id}.`);
      return;
    }

    this.processedEventIds.add(event.id);

    switch (event.type) {
      case 'payment_intent.succeeded':
      case 'checkout.session.completed':
        return this.handlePaymentSucceeded(event.data.object);

      case 'payment_intent.payment_failed':
      case 'checkout.session.expired':
        return this.handlePaymentFailed(event.data.object);

      case 'charge.refunded':
        this.logger.warn(
          'Refund event received. Wire this into your returns workflow.',
        );
        return;

      default:
        this.logger.debug(`Unhandled Stripe event type: ${event.type}`);
    }
  }

  private async handlePaymentSucceeded(
    payload: Record<string, unknown>,
  ): Promise<CheckoutOrderView | void> {
    const order = this.findOrderFromPayload(payload);

    if (!order) {
      this.logger.warn(
        'Payment success webhook received without a known checkout token.',
      );
      return;
    }

    if (order.status !== OrderStatus.PAID) {
      this.inventoryService.confirmReservation(order.checkoutToken);
      order.status = OrderStatus.PAID;
      order.paymentStatus = 'paid';
      order.updatedAt = new Date().toISOString();

      if (typeof payload.id === 'string') {
        order.stripeCheckoutSessionId = payload.id;
      }

      if (typeof payload.payment_intent === 'string') {
        order.stripePaymentIntentId = payload.payment_intent;
      }
    }

    this.logger.log(
      `Payment succeeded for checkout token: ${order.checkoutToken}`,
    );

    return order;
  }

  private async handlePaymentFailed(
    payload: Record<string, unknown>,
  ): Promise<CheckoutOrderView | void> {
    const order = this.findOrderFromPayload(payload);

    if (!order) {
      this.logger.warn(
        'Payment failure webhook received without a known checkout token.',
      );
      return;
    }

    if (order.status !== OrderStatus.CANCELLED) {
      this.inventoryService.releaseReservation(order.checkoutToken);

      if (order.couponCode) {
        await this.discountsService.releaseCouponUsage(order.couponCode);
      }

      order.status = OrderStatus.CANCELLED;
      order.paymentStatus = 'failed';
      order.updatedAt = new Date().toISOString();

      if (typeof payload.id === 'string') {
        order.stripeCheckoutSessionId = payload.id;
      }
    }

    this.logger.warn(
      `Payment failed for checkout token: ${order.checkoutToken}`,
    );

    return order;
  }

  private async ensureInventorySeeded(
    sku: string,
    currencyCode: string,
  ): Promise<void> {
    try {
      this.inventoryService.getSnapshot(sku);
      return;
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        throw error;
      }
    }

    if (!this.catalogService) {
      throw new NotFoundException(
        `No inventory record found for SKU \`${sku}\`.`,
      );
    }

    const variant = await this.catalogService.resolveVariantSnapshot(
      sku,
      currencyCode,
    );

    this.inventoryService.seed([
      {
        sku: variant.sku,
        onHand: variant.inventoryOnHand,
        reserved: variant.inventoryReserved,
      },
    ]);
  }

  private findOrderFromPayload(
    payload: Record<string, unknown>,
  ): CheckoutOrderView | undefined {
    const checkoutToken = this.getCheckoutToken(payload);

    if (checkoutToken) {
      return this.fallbackOrders.get(checkoutToken);
    }

    const sessionId = typeof payload.id === 'string' ? payload.id : undefined;
    const tokenFromSession = sessionId
      ? this.sessionIndex.get(sessionId)
      : undefined;

    return tokenFromSession
      ? this.fallbackOrders.get(tokenFromSession)
      : undefined;
  }

  private getCheckoutToken(
    payload: Record<string, unknown>,
  ): string | undefined {
    const metadata = payload.metadata;

    if (!metadata || typeof metadata !== 'object') {
      return undefined;
    }

    const rawToken = (metadata as Record<string, unknown>).checkoutToken;
    return typeof rawToken === 'string' && rawToken.length > 0
      ? rawToken
      : undefined;
  }

  private isStripeLikeEvent(payload: unknown): payload is StripeLikeEvent {
    if (!payload || typeof payload !== 'object') {
      return false;
    }

    const candidate = payload as Partial<StripeLikeEvent>;
    return !!candidate.id && !!candidate.type && !!candidate.data?.object;
  }

  private assertStatusTransition(from: OrderStatus, to: OrderStatus): void {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
      [OrderStatus.PAID]: [
        OrderStatus.SHIPPED,
        OrderStatus.CANCELLED,
        OrderStatus.REFUNDED,
      ],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.REFUNDED],
      [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
    };

    if (!transitions[from].includes(to)) {
      throw new BadRequestException(
        `Invalid order status transition from \`${from}\` to \`${to}\`.`,
      );
    }
  }

  private nextOrderNumber(): string {
    this.orderSequence += 1;
    return `AURA-${String(this.orderSequence).padStart(6, '0')}`;
  }

  private roundCurrency(value: number): number {
    return Number(value.toFixed(2));
  }
}
