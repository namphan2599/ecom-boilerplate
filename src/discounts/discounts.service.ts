import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CouponType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { buildSeedCouponFixtures } from '../seeding/fixtures/coupons.fixtures';

export interface ApplyCouponInput {
  code: string;
  subtotal: number;
  currencyCode: string;
  now?: Date;
}

export interface CouponView {
  id: string;
  code: string;
  description?: string | null;
  type: CouponType;
  value: number;
  currencyCode?: string | null;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  startsAt?: Date | null;
  expiresAt?: Date | null;
  usageLimit?: number | null;
  usageCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CouponApplicationResult {
  coupon: CouponView;
  subtotal: number;
  currencyCode: string;
  discountAmount: number;
  finalTotal: number;
}

@Injectable()
export class DiscountsService {
  private readonly fallbackCoupons = new Map<string, CouponView>();

  constructor(private readonly prisma?: PrismaService) {
    this.seedFallbackCoupons();
  }

  async validateAndApplyCoupon(
    input: ApplyCouponInput,
  ): Promise<CouponApplicationResult> {
    const normalizedCode = this.normalizeCode(input.code);
    const normalizedCurrency = input.currencyCode.toUpperCase();
    const subtotal = this.roundCurrency(input.subtotal);
    this.assertSubtotal(subtotal);

    const coupon = await this.getCouponByCode(normalizedCode);
    this.assertCouponIsUsable(
      coupon,
      subtotal,
      normalizedCurrency,
      input.now ?? new Date(),
    );

    const rawDiscount =
      coupon.type === CouponType.PERCENTAGE
        ? subtotal * (coupon.value / 100)
        : coupon.value;

    const cappedDiscount =
      coupon.maxDiscountAmount !== null &&
      coupon.maxDiscountAmount !== undefined
        ? Math.min(rawDiscount, coupon.maxDiscountAmount)
        : rawDiscount;

    const discountAmount = this.roundCurrency(Math.min(cappedDiscount, subtotal));
    const finalTotal = this.roundCurrency(Math.max(subtotal - discountAmount, 0));

    return {
      coupon,
      subtotal,
      currencyCode: normalizedCurrency,
      discountAmount,
      finalTotal,
    };
  }

  async markCouponUsed(code: string): Promise<CouponView> {
    const normalizedCode = this.normalizeCode(code);

    if (this.prisma?.isReady()) {
      return this.prisma.$transaction(async (tx) => {
        const coupon = await tx.coupon.findUnique({
          where: { code: normalizedCode },
        });

        const mapped = this.mapCouponOrThrow(coupon, normalizedCode);
        this.assertCouponUsageAvailable(mapped);

        const updated = await tx.coupon.update({
          where: { code: normalizedCode },
          data: {
            usageCount: {
              increment: 1,
            },
          },
        });

        return this.toCouponView(updated);
      });
    }

    const coupon = await this.getCouponByCode(normalizedCode);
    this.assertCouponUsageAvailable(coupon);

    const updated: CouponView = {
      ...coupon,
      usageCount: coupon.usageCount + 1,
      updatedAt: new Date(),
    };

    this.fallbackCoupons.set(updated.code, updated);
    return updated;
  }

  async releaseCouponUsage(code: string): Promise<CouponView> {
    const normalizedCode = this.normalizeCode(code);

    if (this.prisma?.isReady()) {
      return this.prisma.$transaction(async (tx) => {
        const coupon = await tx.coupon.findUnique({
          where: { code: normalizedCode },
        });

        const mapped = this.mapCouponOrThrow(coupon, normalizedCode);
        if (mapped.usageCount === 0) {
          return mapped;
        }

        const updated = await tx.coupon.update({
          where: { code: normalizedCode },
          data: {
            usageCount: {
              decrement: 1,
            },
          },
        });

        return this.toCouponView(updated);
      });
    }

    const coupon = await this.getCouponByCode(normalizedCode);
    if (coupon.usageCount === 0) {
      return coupon;
    }

    const updated: CouponView = {
      ...coupon,
      usageCount: coupon.usageCount - 1,
      updatedAt: new Date(),
    };

    this.fallbackCoupons.set(updated.code, updated);
    return updated;
  }

  private async getCouponByCode(code: string): Promise<CouponView> {
    if (this.prisma?.isReady()) {
      const coupon = await this.prisma.coupon.findUnique({ where: { code } });
      return this.mapCouponOrThrow(coupon, code);
    }

    const coupon = this.fallbackCoupons.get(code);
    if (!coupon) {
      throw new BadRequestException(`Coupon code \`${code}\` is invalid.`);
    }

    return coupon;
  }

  private mapCouponOrThrow(
    coupon: {
      id: string;
      code: string;
      description: string | null;
      type: CouponType;
      value: Prisma.Decimal;
      currencyCode: string | null;
      minOrderAmount: Prisma.Decimal | null;
      maxDiscountAmount: Prisma.Decimal | null;
      startsAt: Date | null;
      expiresAt: Date | null;
      usageLimit: number | null;
      usageCount: number;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    } | null,
    code: string,
  ): CouponView {
    if (!coupon) {
      throw new BadRequestException(`Coupon code \`${code}\` is invalid.`);
    }

    return this.toCouponView(coupon);
  }

  private toCouponView(coupon: {
    id: string;
    code: string;
    description: string | null;
    type: CouponType;
    value: Prisma.Decimal | number;
    currencyCode: string | null;
    minOrderAmount: Prisma.Decimal | number | null;
    maxDiscountAmount: Prisma.Decimal | number | null;
    startsAt: Date | null;
    expiresAt: Date | null;
    usageLimit: number | null;
    usageCount: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): CouponView {
    return {
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      value: Number(coupon.value),
      currencyCode: coupon.currencyCode,
      minOrderAmount:
        coupon.minOrderAmount !== null && coupon.minOrderAmount !== undefined
          ? Number(coupon.minOrderAmount)
          : null,
      maxDiscountAmount:
        coupon.maxDiscountAmount !== null &&
        coupon.maxDiscountAmount !== undefined
          ? Number(coupon.maxDiscountAmount)
          : null,
      startsAt: coupon.startsAt,
      expiresAt: coupon.expiresAt,
      usageLimit: coupon.usageLimit,
      usageCount: coupon.usageCount,
      isActive: coupon.isActive,
      createdAt: coupon.createdAt,
      updatedAt: coupon.updatedAt,
    };
  }

  private assertCouponIsUsable(
    coupon: CouponView,
    subtotal: number,
    currencyCode: string,
    now: Date,
  ): void {
    if (!coupon.isActive) {
      throw new BadRequestException(`Coupon code \`${coupon.code}\` is inactive.`);
    }

    if (coupon.startsAt && coupon.startsAt.getTime() > now.getTime()) {
      throw new BadRequestException(
        `Coupon code \`${coupon.code}\` is not active yet.`,
      );
    }

    if (coupon.expiresAt && coupon.expiresAt.getTime() < now.getTime()) {
      throw new BadRequestException(`Coupon code \`${coupon.code}\` has expired.`);
    }

    this.assertCouponUsageAvailable(coupon);

    if (
      coupon.minOrderAmount !== null &&
      coupon.minOrderAmount !== undefined &&
      subtotal < coupon.minOrderAmount
    ) {
      throw new BadRequestException(
        `Coupon code \`${coupon.code}\` requires a minimum subtotal of ${coupon.minOrderAmount.toFixed(2)} ${currencyCode}.`,
      );
    }

    if (
      coupon.type === CouponType.FIXED_AMOUNT &&
      coupon.currencyCode &&
      coupon.currencyCode.toUpperCase() !== currencyCode
    ) {
      throw new BadRequestException(
        `Coupon code \`${coupon.code}\` is not valid for ${currencyCode}.`,
      );
    }
  }

  private assertCouponUsageAvailable(coupon: CouponView): void {
    if (
      coupon.usageLimit !== null &&
      coupon.usageLimit !== undefined &&
      coupon.usageCount >= coupon.usageLimit
    ) {
      throw new ConflictException(
        `Coupon code \`${coupon.code}\` has reached its usage limit.`,
      );
    }
  }

  private assertSubtotal(subtotal: number): void {
    if (Number.isNaN(subtotal) || subtotal < 0) {
      throw new BadRequestException('Subtotal must be a non-negative number.');
    }
  }

  private normalizeCode(code: string): string {
    const normalized = code.trim().toUpperCase();

    if (!normalized) {
      throw new BadRequestException('Coupon code is required.');
    }

    return normalized;
  }

  private roundCurrency(value: number): number {
    return Number(value.toFixed(2));
  }

  private seedFallbackCoupons(): void {
    if (this.fallbackCoupons.size > 0) {
      return;
    }

    const coupons: CouponView[] = buildSeedCouponFixtures(new Date(), 'demo');

    for (const coupon of coupons) {
      this.fallbackCoupons.set(coupon.code, coupon);
    }
  }
}
