import { CouponType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
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
export declare class DiscountsService {
    private readonly prisma?;
    private readonly fallbackCoupons;
    constructor(prisma?: PrismaService | undefined);
    validateAndApplyCoupon(input: ApplyCouponInput): Promise<CouponApplicationResult>;
    markCouponUsed(code: string): Promise<CouponView>;
    releaseCouponUsage(code: string): Promise<CouponView>;
    private getCouponByCode;
    private mapCouponOrThrow;
    private toCouponView;
    private assertCouponIsUsable;
    private assertCouponUsageAvailable;
    private assertSubtotal;
    private normalizeCode;
    private roundCurrency;
    private seedFallbackCoupons;
}
