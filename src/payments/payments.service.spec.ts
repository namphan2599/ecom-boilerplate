import { beforeEach, describe, expect, it } from '@jest/globals';
import type { AuthenticatedUser } from '../auth/auth.service';
import type { CartView } from '../cart/cart.service';
import { DiscountsService } from '../discounts/discounts.service';
import { InventoryService } from '../inventory/inventory.service';
import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  let inventoryService: InventoryService;
  let discountsService: DiscountsService;
  let service: PaymentsService;

  const customer: AuthenticatedUser = {
    userId: 'customer-local',
    email: 'customer@aura.local',
    role: 'CUSTOMER' as const,
    displayName: 'Aura Customer',
    provider: 'local',
  };

  const buildCart = (): CartView => ({
    userId: customer.userId,
    items: [
      {
        productId: 'prod-hoodie',
        variantId: 'var-hoodie',
        sku: 'HOODIE-BLK-M',
        productName: 'Aura Signature Hoodie',
        variantName: 'Black / Medium',
        attributes: { color: 'black', size: 'M' },
        currencyCode: 'USD',
        unitPrice: 79.99,
        compareAtAmount: 89.99,
        quantity: 2,
        lineTotal: 159.98,
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    summary: {
      currencyCode: 'USD',
      itemCount: 2,
      distinctItems: 1,
      subtotal: 159.98,
    },
    persistence: 'memory',
    updatedAt: new Date().toISOString(),
  });

  beforeEach(() => {
    inventoryService = new InventoryService();
    inventoryService.seed([
      {
        sku: 'HOODIE-BLK-M',
        onHand: 10,
        reserved: 0,
        safetyStock: 0,
      },
    ]);
    discountsService = new DiscountsService();
    service = new PaymentsService(inventoryService, discountsService);
  });

  it('creates a hosted checkout session and reserves inventory', async () => {
    const session = await service.createCheckoutSession({
      customer,
      cart: buildCart(),
      couponCode: 'AURA20',
    });

    expect(session.sessionId).toMatch(/^cs_test_/);
    expect(session.checkoutUrl).toContain(session.sessionId);
    expect(session.order.status).toBe('PENDING');
    expect(session.order.discountTotal).toBe(30);
    expect(inventoryService.getSnapshot('HOODIE-BLK-M')).toMatchObject({
      onHand: 10,
      reserved: 2,
    });
  });

  it('confirms stock and marks the order as paid on success webhooks', async () => {
    const session = await service.createCheckoutSession({
      customer,
      cart: buildCart(),
    });

    await service.handleWebhookEvent({
      id: 'evt_checkout_success',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: session.sessionId,
          payment_intent: 'pi_success_123',
          metadata: { checkoutToken: session.checkoutToken },
        },
      },
    });

    const order = service.getOrderByCheckoutToken(session.checkoutToken);

    expect(order.status).toBe('PAID');
    expect(order.paymentStatus).toBe('paid');
    expect(inventoryService.getSnapshot('HOODIE-BLK-M')).toMatchObject({
      onHand: 8,
      reserved: 0,
    });
  });

  it('releases inventory and coupon usage on failed or expired checkout events', async () => {
    const session = await service.createCheckoutSession({
      customer,
      cart: buildCart(),
      couponCode: 'ONEUSE',
    });

    await service.handleWebhookEvent({
      id: 'evt_checkout_expired',
      type: 'checkout.session.expired',
      data: {
        object: {
          id: session.sessionId,
          metadata: { checkoutToken: session.checkoutToken },
        },
      },
    });

    const order = service.getOrderByCheckoutToken(session.checkoutToken);

    expect(order.status).toBe('CANCELLED');
    expect(order.paymentStatus).toBe('failed');
    expect(inventoryService.getSnapshot('HOODIE-BLK-M')).toMatchObject({
      onHand: 10,
      reserved: 0,
    });

    await expect(discountsService.markCouponUsed('ONEUSE')).resolves.toMatchObject({
      usageCount: 1,
    });
  });

  it('ignores duplicate webhook event ids idempotently', async () => {
    const session = await service.createCheckoutSession({
      customer,
      cart: buildCart(),
    });

    const event = {
      id: 'evt_duplicate_guard',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: session.sessionId,
          payment_intent: 'pi_dupe_123',
          metadata: { checkoutToken: session.checkoutToken },
        },
      },
    } as const;

    await service.handleWebhookEvent(event);
    await service.handleWebhookEvent(event);

    expect(inventoryService.getSnapshot('HOODIE-BLK-M')).toMatchObject({
      onHand: 8,
      reserved: 0,
    });
  });
});
