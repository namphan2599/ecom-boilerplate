import { CouponType } from '@prisma/client';
import type { SeedProfileLike } from './catalog.fixtures';

export interface SeedCouponFixture {
  id: string;
  code: string;
  description: string;
  type: CouponType;
  value: number;
  currencyCode: string | null;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  startsAt: Date | null;
  expiresAt: Date | null;
  usageLimit: number | null;
  usageCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function buildSeedCouponFixtures(
  now: Date = new Date(),
  profile: SeedProfileLike = 'demo',
): SeedCouponFixture[] {
  const activeStart = new Date(now.getTime() - 60 * 60 * 1000);
  const activeEnd = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30);
  const expiredAt = new Date(now.getTime() - 1000 * 60 * 60 * 24);

  const coupons: SeedCouponFixture[] = [
    {
      id: 'coupon-aura20',
      code: 'AURA20',
      description: '20% off with a maximum discount of $30.',
      type: CouponType.PERCENTAGE,
      value: 20,
      currencyCode: null,
      minOrderAmount: null,
      maxDiscountAmount: 30,
      startsAt: activeStart,
      expiresAt: activeEnd,
      usageLimit: 500,
      usageCount: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'coupon-save20usd',
      code: 'SAVE20USD',
      description: '$20 off any USD cart.',
      type: CouponType.FIXED_AMOUNT,
      value: 20,
      currencyCode: 'USD',
      minOrderAmount: null,
      maxDiscountAmount: null,
      startsAt: activeStart,
      expiresAt: activeEnd,
      usageLimit: 500,
      usageCount: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'coupon-expired10',
      code: 'EXPIRED10',
      description: 'Expired coupon fixture.',
      type: CouponType.PERCENTAGE,
      value: 10,
      currencyCode: null,
      minOrderAmount: null,
      maxDiscountAmount: null,
      startsAt: activeStart,
      expiresAt: expiredAt,
      usageLimit: 100,
      usageCount: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'coupon-inactive5',
      code: 'INACTIVE5',
      description: 'Inactive coupon fixture.',
      type: CouponType.FIXED_AMOUNT,
      value: 5,
      currencyCode: 'USD',
      minOrderAmount: null,
      maxDiscountAmount: null,
      startsAt: activeStart,
      expiresAt: activeEnd,
      usageLimit: 100,
      usageCount: 0,
      isActive: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'coupon-limited1',
      code: 'LIMITED1',
      description: 'Usage-capped coupon fixture.',
      type: CouponType.PERCENTAGE,
      value: 15,
      currencyCode: null,
      minOrderAmount: null,
      maxDiscountAmount: null,
      startsAt: activeStart,
      expiresAt: activeEnd,
      usageLimit: 1,
      usageCount: 1,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'coupon-oneuse',
      code: 'ONEUSE',
      description: 'Single-use coupon fixture.',
      type: CouponType.FIXED_AMOUNT,
      value: 10,
      currencyCode: 'USD',
      minOrderAmount: null,
      maxDiscountAmount: null,
      startsAt: activeStart,
      expiresAt: activeEnd,
      usageLimit: 1,
      usageCount: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  return profile === 'minimal' ? coupons.slice(0, 1) : coupons;
}
