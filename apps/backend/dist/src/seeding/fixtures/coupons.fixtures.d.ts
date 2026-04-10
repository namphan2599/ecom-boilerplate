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
export declare function buildSeedCouponFixtures(now?: Date, profile?: SeedProfileLike): SeedCouponFixture[];
