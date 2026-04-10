import { BadRequestException, ConflictException } from '@nestjs/common';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { DiscountsService } from './discounts.service';

describe('DiscountsService', () => {
  let service: DiscountsService;

  beforeEach(() => {
    service = new DiscountsService();
  });

  it('applies percentage coupons with max discount caps', async () => {
    const result = await service.validateAndApplyCoupon({
      code: 'AURA20',
      subtotal: 200,
      currencyCode: 'USD',
    });

    expect(result.discountAmount).toBe(30);
    expect(result.finalTotal).toBe(170);
    expect(result.coupon.code).toBe('AURA20');
  });

  it('applies fixed amount coupons without producing negative totals', async () => {
    const result = await service.validateAndApplyCoupon({
      code: 'SAVE20USD',
      subtotal: 15,
      currencyCode: 'USD',
    });

    expect(result.discountAmount).toBe(15);
    expect(result.finalTotal).toBe(0);
  });

  it('normalizes coupon codes and enforces fixed-amount currency matching', async () => {
    const normalized = await service.validateAndApplyCoupon({
      code: ' aura20 ',
      subtotal: 100,
      currencyCode: 'usd',
    });

    expect(normalized.coupon.code).toBe('AURA20');
    expect(normalized.currencyCode).toBe('USD');

    await expect(
      service.validateAndApplyCoupon({
        code: 'SAVE20USD',
        subtotal: 100,
        currencyCode: 'EUR',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects expired, inactive, and usage-capped coupons', async () => {
    await expect(
      service.validateAndApplyCoupon({
        code: 'EXPIRED10',
        subtotal: 120,
        currencyCode: 'USD',
      }),
    ).rejects.toThrow(BadRequestException);

    await expect(
      service.validateAndApplyCoupon({
        code: 'INACTIVE5',
        subtotal: 120,
        currencyCode: 'USD',
      }),
    ).rejects.toThrow(BadRequestException);

    await expect(
      service.validateAndApplyCoupon({
        code: 'LIMITED1',
        subtotal: 120,
        currencyCode: 'USD',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('enforces usage limits when consuming a coupon', async () => {
    const firstUse = await service.markCouponUsed('ONEUSE');

    expect(firstUse.usageCount).toBe(1);

    await expect(service.markCouponUsed('ONEUSE')).rejects.toThrow(
      ConflictException,
    );
  });
});
