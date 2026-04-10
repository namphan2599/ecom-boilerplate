"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscountsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const coupons_fixtures_1 = require("../seeding/fixtures/coupons.fixtures");
let DiscountsService = class DiscountsService {
    prisma;
    fallbackCoupons = new Map();
    constructor(prisma) {
        this.prisma = prisma;
        this.seedFallbackCoupons();
    }
    async validateAndApplyCoupon(input) {
        const normalizedCode = this.normalizeCode(input.code);
        const normalizedCurrency = input.currencyCode.toUpperCase();
        const subtotal = this.roundCurrency(input.subtotal);
        this.assertSubtotal(subtotal);
        const coupon = await this.getCouponByCode(normalizedCode);
        this.assertCouponIsUsable(coupon, subtotal, normalizedCurrency, input.now ?? new Date());
        const rawDiscount = coupon.type === client_1.CouponType.PERCENTAGE
            ? subtotal * (coupon.value / 100)
            : coupon.value;
        const cappedDiscount = coupon.maxDiscountAmount !== null &&
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
    async markCouponUsed(code) {
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
        const updated = {
            ...coupon,
            usageCount: coupon.usageCount + 1,
            updatedAt: new Date(),
        };
        this.fallbackCoupons.set(updated.code, updated);
        return updated;
    }
    async releaseCouponUsage(code) {
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
        const updated = {
            ...coupon,
            usageCount: coupon.usageCount - 1,
            updatedAt: new Date(),
        };
        this.fallbackCoupons.set(updated.code, updated);
        return updated;
    }
    async getCouponByCode(code) {
        if (this.prisma?.isReady()) {
            const coupon = await this.prisma.coupon.findUnique({ where: { code } });
            return this.mapCouponOrThrow(coupon, code);
        }
        const coupon = this.fallbackCoupons.get(code);
        if (!coupon) {
            throw new common_1.BadRequestException(`Coupon code \`${code}\` is invalid.`);
        }
        return coupon;
    }
    mapCouponOrThrow(coupon, code) {
        if (!coupon) {
            throw new common_1.BadRequestException(`Coupon code \`${code}\` is invalid.`);
        }
        return this.toCouponView(coupon);
    }
    toCouponView(coupon) {
        return {
            id: coupon.id,
            code: coupon.code,
            description: coupon.description,
            type: coupon.type,
            value: Number(coupon.value),
            currencyCode: coupon.currencyCode,
            minOrderAmount: coupon.minOrderAmount !== null && coupon.minOrderAmount !== undefined
                ? Number(coupon.minOrderAmount)
                : null,
            maxDiscountAmount: coupon.maxDiscountAmount !== null &&
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
    assertCouponIsUsable(coupon, subtotal, currencyCode, now) {
        if (!coupon.isActive) {
            throw new common_1.BadRequestException(`Coupon code \`${coupon.code}\` is inactive.`);
        }
        if (coupon.startsAt && coupon.startsAt.getTime() > now.getTime()) {
            throw new common_1.BadRequestException(`Coupon code \`${coupon.code}\` is not active yet.`);
        }
        if (coupon.expiresAt && coupon.expiresAt.getTime() < now.getTime()) {
            throw new common_1.BadRequestException(`Coupon code \`${coupon.code}\` has expired.`);
        }
        this.assertCouponUsageAvailable(coupon);
        if (coupon.minOrderAmount !== null &&
            coupon.minOrderAmount !== undefined &&
            subtotal < coupon.minOrderAmount) {
            throw new common_1.BadRequestException(`Coupon code \`${coupon.code}\` requires a minimum subtotal of ${coupon.minOrderAmount.toFixed(2)} ${currencyCode}.`);
        }
        if (coupon.type === client_1.CouponType.FIXED_AMOUNT &&
            coupon.currencyCode &&
            coupon.currencyCode.toUpperCase() !== currencyCode) {
            throw new common_1.BadRequestException(`Coupon code \`${coupon.code}\` is not valid for ${currencyCode}.`);
        }
    }
    assertCouponUsageAvailable(coupon) {
        if (coupon.usageLimit !== null &&
            coupon.usageLimit !== undefined &&
            coupon.usageCount >= coupon.usageLimit) {
            throw new common_1.ConflictException(`Coupon code \`${coupon.code}\` has reached its usage limit.`);
        }
    }
    assertSubtotal(subtotal) {
        if (Number.isNaN(subtotal) || subtotal < 0) {
            throw new common_1.BadRequestException('Subtotal must be a non-negative number.');
        }
    }
    normalizeCode(code) {
        const normalized = code.trim().toUpperCase();
        if (!normalized) {
            throw new common_1.BadRequestException('Coupon code is required.');
        }
        return normalized;
    }
    roundCurrency(value) {
        return Number(value.toFixed(2));
    }
    seedFallbackCoupons() {
        if (this.fallbackCoupons.size > 0) {
            return;
        }
        const coupons = (0, coupons_fixtures_1.buildSeedCouponFixtures)(new Date(), 'demo');
        for (const coupon of coupons) {
            this.fallbackCoupons.set(coupon.code, coupon);
        }
    }
};
exports.DiscountsService = DiscountsService;
exports.DiscountsService = DiscountsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DiscountsService);
//# sourceMappingURL=discounts.service.js.map