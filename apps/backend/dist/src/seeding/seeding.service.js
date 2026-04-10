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
var SeedingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedingService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const role_enum_1 = require("../common/auth/role.enum");
const prisma_service_1 = require("../prisma/prisma.service");
const catalog_fixtures_1 = require("./fixtures/catalog.fixtures");
const coupons_fixtures_1 = require("./fixtures/coupons.fixtures");
const users_fixtures_1 = require("./fixtures/users.fixtures");
let SeedingService = SeedingService_1 = class SeedingService {
    prisma;
    logger = new common_1.Logger(SeedingService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async seed(profileInput = 'demo') {
        const profile = this.resolveProfile(profileInput);
        this.assertSafeToSeed();
        if (!this.prisma.isReady()) {
            throw new Error('Prisma is not connected. Configure DATABASE_URL and start the database before seeding.');
        }
        const summary = this.createEmptySummary(profile);
        await this.seedUsers(summary);
        await this.seedCatalog(summary, profile);
        await this.seedCoupons(summary, profile);
        this.logger.log(`Seed run completed for profile \`${profile}\`.`);
        this.logger.log(JSON.stringify(summary, null, 2));
        return summary;
    }
    async seedUsers(summary) {
        for (const fixture of users_fixtures_1.SEED_LOCAL_USERS) {
            const email = fixture.email.trim().toLowerCase();
            const existingUser = await this.prisma.user.findUnique({
                where: { email },
            });
            const passwordHash = fixture.passwordHash;
            const user = await this.prisma.user.upsert({
                where: { email },
                create: {
                    id: fixture.id,
                    email,
                    passwordHash,
                    firstName: fixture.firstName,
                    lastName: fixture.lastName ?? null,
                    role: this.mapRole(fixture.role),
                    isActive: true,
                    emailVerifiedAt: new Date(),
                },
                update: {
                    passwordHash,
                    firstName: fixture.firstName,
                    lastName: fixture.lastName ?? null,
                    role: this.mapRole(fixture.role),
                    isActive: true,
                    emailVerifiedAt: existingUser?.emailVerifiedAt ?? new Date(),
                },
            });
            this.bump(summary.users, Boolean(existingUser));
            const providerSubject = email;
            const existingIdentity = await this.prisma.authIdentity.findUnique({
                where: {
                    provider_providerSubject: {
                        provider: client_1.AuthProvider.LOCAL,
                        providerSubject,
                    },
                },
            });
            await this.prisma.authIdentity.upsert({
                where: {
                    provider_providerSubject: {
                        provider: client_1.AuthProvider.LOCAL,
                        providerSubject,
                    },
                },
                create: {
                    userId: user.id,
                    provider: client_1.AuthProvider.LOCAL,
                    providerSubject,
                },
                update: {
                    userId: user.id,
                },
            });
            this.bump(summary.authIdentities, Boolean(existingIdentity));
        }
    }
    async seedCatalog(summary, profile) {
        const products = (0, catalog_fixtures_1.getSeedProducts)(profile);
        const categories = this.uniqueBy(products.map((product) => product.category), (category) => category.slug);
        const tags = this.uniqueBy(products.flatMap((product) => product.tags), (tag) => tag.slug);
        const categoryIds = new Map();
        for (const category of categories) {
            const existingCategory = await this.prisma.category.findUnique({
                where: { slug: category.slug },
            });
            const savedCategory = await this.prisma.category.upsert({
                where: { slug: category.slug },
                create: {
                    name: category.name,
                    slug: category.slug,
                    description: category.description ?? null,
                },
                update: {
                    name: category.name,
                    description: category.description ?? null,
                },
            });
            categoryIds.set(category.slug, savedCategory.id);
            this.bump(summary.categories, Boolean(existingCategory));
        }
        for (const tag of tags) {
            const existingTag = await this.prisma.tag.findUnique({
                where: { slug: tag.slug },
            });
            await this.prisma.tag.upsert({
                where: { slug: tag.slug },
                create: {
                    name: tag.name,
                    slug: tag.slug,
                },
                update: {
                    name: tag.name,
                },
            });
            this.bump(summary.tags, Boolean(existingTag));
        }
        for (const product of products) {
            await this.seedProduct(summary, product, categoryIds);
        }
    }
    async seedCoupons(summary, profile) {
        const coupons = (0, coupons_fixtures_1.buildSeedCouponFixtures)(new Date(), profile);
        for (const coupon of coupons) {
            const existingCoupon = await this.prisma.coupon.findUnique({
                where: { code: coupon.code },
            });
            await this.prisma.coupon.upsert({
                where: { code: coupon.code },
                create: {
                    code: coupon.code,
                    description: coupon.description,
                    type: coupon.type,
                    value: new client_1.Prisma.Decimal(coupon.value),
                    currencyCode: coupon.currencyCode,
                    minOrderAmount: coupon.minOrderAmount !== null
                        ? new client_1.Prisma.Decimal(coupon.minOrderAmount)
                        : null,
                    maxDiscountAmount: coupon.maxDiscountAmount !== null
                        ? new client_1.Prisma.Decimal(coupon.maxDiscountAmount)
                        : null,
                    startsAt: coupon.startsAt,
                    expiresAt: coupon.expiresAt,
                    usageLimit: coupon.usageLimit,
                    usageCount: coupon.usageCount,
                    isActive: coupon.isActive,
                },
                update: {
                    description: coupon.description,
                    type: coupon.type,
                    value: new client_1.Prisma.Decimal(coupon.value),
                    currencyCode: coupon.currencyCode,
                    minOrderAmount: coupon.minOrderAmount !== null
                        ? new client_1.Prisma.Decimal(coupon.minOrderAmount)
                        : null,
                    maxDiscountAmount: coupon.maxDiscountAmount !== null
                        ? new client_1.Prisma.Decimal(coupon.maxDiscountAmount)
                        : null,
                    startsAt: coupon.startsAt,
                    expiresAt: coupon.expiresAt,
                    usageLimit: coupon.usageLimit,
                    usageCount: coupon.usageCount,
                    isActive: coupon.isActive,
                },
            });
            this.bump(summary.coupons, Boolean(existingCoupon));
        }
    }
    async seedProduct(summary, product, categoryIds) {
        const existingProduct = await this.prisma.product.findUnique({
            where: { slug: product.slug },
        });
        const savedProduct = await this.prisma.product.upsert({
            where: { slug: product.slug },
            create: {
                name: product.name,
                slug: product.slug,
                description: product.description ?? null,
                status: product.status ?? client_1.ProductStatus.DRAFT,
                isFeatured: product.isFeatured ?? false,
                categoryId: categoryIds.get(product.category.slug) ?? null,
                imageUrl: product.imageUrl ?? null,
            },
            update: {
                name: product.name,
                description: product.description ?? null,
                status: product.status ?? client_1.ProductStatus.DRAFT,
                isFeatured: product.isFeatured ?? false,
                categoryId: categoryIds.get(product.category.slug) ?? null,
                imageUrl: product.imageUrl ?? null,
            },
        });
        this.bump(summary.products, Boolean(existingProduct));
        await this.prisma.product.update({
            where: { slug: product.slug },
            data: {
                tags: {
                    set: [],
                    connect: product.tags.map((tag) => ({ slug: tag.slug })),
                },
            },
        });
        for (const variant of product.variants) {
            const existingVariant = await this.prisma.productVariant.findUnique({
                where: { sku: variant.sku },
            });
            const savedVariant = await this.prisma.productVariant.upsert({
                where: { sku: variant.sku },
                create: {
                    productId: savedProduct.id,
                    sku: variant.sku,
                    title: variant.title,
                    attributes: variant.attributes,
                    inventoryOnHand: variant.inventoryOnHand,
                    inventoryReserved: variant.inventoryReserved ?? 0,
                    isActive: variant.isActive ?? true,
                },
                update: {
                    productId: savedProduct.id,
                    title: variant.title,
                    attributes: variant.attributes,
                    inventoryOnHand: variant.inventoryOnHand,
                    inventoryReserved: variant.inventoryReserved ?? 0,
                    isActive: variant.isActive ?? true,
                },
            });
            this.bump(summary.variants, Boolean(existingVariant));
            for (const price of variant.prices) {
                const currencyCode = price.currencyCode.toUpperCase();
                const existingPrice = await this.prisma.productVariantPrice.findUnique({
                    where: {
                        variantId_currencyCode: {
                            variantId: savedVariant.id,
                            currencyCode,
                        },
                    },
                });
                await this.prisma.productVariantPrice.upsert({
                    where: {
                        variantId_currencyCode: {
                            variantId: savedVariant.id,
                            currencyCode,
                        },
                    },
                    create: {
                        variantId: savedVariant.id,
                        currencyCode,
                        amount: new client_1.Prisma.Decimal(price.amount),
                        compareAtAmount: price.compareAtAmount !== null &&
                            price.compareAtAmount !== undefined
                            ? new client_1.Prisma.Decimal(price.compareAtAmount)
                            : null,
                    },
                    update: {
                        amount: new client_1.Prisma.Decimal(price.amount),
                        compareAtAmount: price.compareAtAmount !== null &&
                            price.compareAtAmount !== undefined
                            ? new client_1.Prisma.Decimal(price.compareAtAmount)
                            : null,
                    },
                });
                this.bump(summary.prices, Boolean(existingPrice));
            }
        }
    }
    createEmptySummary(profile) {
        return {
            profile,
            users: this.createRunStat(),
            authIdentities: this.createRunStat(),
            categories: this.createRunStat(),
            tags: this.createRunStat(),
            products: this.createRunStat(),
            variants: this.createRunStat(),
            prices: this.createRunStat(),
            coupons: this.createRunStat(),
        };
    }
    createRunStat() {
        return {
            created: 0,
            updated: 0,
        };
    }
    bump(stat, alreadyExists) {
        if (alreadyExists) {
            stat.updated += 1;
            return;
        }
        stat.created += 1;
    }
    assertSafeToSeed() {
        const nodeEnv = (process.env.NODE_ENV ?? 'development').toLowerCase();
        const allowProduction = (process.env.ALLOW_SEED_IN_PRODUCTION ?? 'false').toLowerCase() ===
            'true';
        if (nodeEnv === 'production' && !allowProduction) {
            throw new Error('Data seeding is disabled in production unless explicitly allowed.');
        }
    }
    resolveProfile(profileInput) {
        const normalized = (profileInput ?? 'demo').trim().toLowerCase();
        if (normalized === 'minimal' || normalized === 'demo') {
            return normalized;
        }
        throw new Error(`Unsupported seed profile \`${profileInput}\`. Use \`minimal\` or \`demo\`.`);
    }
    mapRole(role) {
        return role === role_enum_1.AppRole.ADMIN ? client_1.Role.ADMIN : client_1.Role.CUSTOMER;
    }
    uniqueBy(items, keySelector) {
        const seen = new Map();
        for (const item of items) {
            seen.set(keySelector(item), item);
        }
        return [...seen.values()];
    }
};
exports.SeedingService = SeedingService;
exports.SeedingService = SeedingService = SeedingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SeedingService);
//# sourceMappingURL=seeding.service.js.map