import { BadRequestException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { AppRole } from '../common/auth/role.enum';
import { InventoryService } from '../inventory/inventory.service';
import { PaymentsModule } from './payments.module';
import { PaymentsService } from './payments.service';

describe('PaymentsService integration', () => {
  let moduleRef: TestingModule;
  let paymentsService: PaymentsService;
  let inventoryService: InventoryService;

  const customer = {
    userId: 'customer-local',
    email: 'customer@aura.local',
    role: AppRole.CUSTOMER,
    displayName: 'Aura Customer',
    provider: 'local' as const,
  };

  const buildCart = () => ({
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
        quantity: 1,
        lineTotal: 79.99,
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    summary: {
      currencyCode: 'USD',
      itemCount: 1,
      distinctItems: 1,
      subtotal: 79.99,
    },
    persistence: 'memory' as const,
    updatedAt: new Date().toISOString(),
  });

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [PaymentsModule],
    }).compile();

    paymentsService = moduleRef.get(PaymentsService);
    inventoryService = moduleRef.get(InventoryService);

    inventoryService.seed([
      {
        sku: 'HOODIE-BLK-M',
        onHand: 5,
        reserved: 0,
        safetyStock: 0,
      },
    ]);
  });

  it('cancels the order and restores stock on an expired checkout event', async () => {
    const session = await paymentsService.createCheckoutSession({
      customer,
      cart: buildCart(),
      couponCode: 'ONEUSE',
    });

    await paymentsService.handleWebhookEvent({
      id: 'evt_checkout_expired_integration',
      type: 'checkout.session.expired',
      data: {
        object: {
          id: session.sessionId,
          metadata: {
            checkoutToken: session.checkoutToken,
          },
        },
      },
    });

    const order = paymentsService.getOrderByCheckoutToken(
      session.checkoutToken,
    );

    expect(order.status).toBe('CANCELLED');
    expect(order.paymentStatus).toBe('failed');
    expect(inventoryService.getSnapshot('HOODIE-BLK-M')).toMatchObject({
      onHand: 5,
      reserved: 0,
    });
  });

  it('rejects invalid order status transitions from pending to shipped', async () => {
    const session = await paymentsService.createCheckoutSession({
      customer,
      cart: buildCart(),
    });

    expect(() =>
      paymentsService.updateOrderStatus(
        session.order.orderNumber,
        OrderStatus.SHIPPED,
      ),
    ).toThrow(BadRequestException);
  });

  afterEach(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }
  });
});
