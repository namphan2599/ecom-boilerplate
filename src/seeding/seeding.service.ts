import { Injectable, Logger } from '@nestjs/common';
import { AuthProvider, Prisma, ProductStatus, Role } from '@prisma/client';
import { AppRole } from '../common/auth/role.enum';
import { PrismaService } from '../prisma/prisma.service';
import {
  getSeedProducts,
  type SeedCategoryFixture,
  type SeedProductFixture,
  type SeedProfileLike,
  type SeedTagFixture,
} from './fixtures/catalog.fixtures';
import { buildSeedCouponFixtures } from './fixtures/coupons.fixtures';
import { SEED_LOCAL_USERS } from './fixtures/users.fixtures';

export type SeedProfile = SeedProfileLike;

export interface SeedRunStat {
  created: number;
  updated: number;
}

export interface SeedSummary {
  profile: SeedProfile;
  users: SeedRunStat;
  authIdentities: SeedRunStat;
  categories: SeedRunStat;
  tags: SeedRunStat;
  products: SeedRunStat;
  variants: SeedRunStat;
  prices: SeedRunStat;
  coupons: SeedRunStat;
}

@Injectable()
export class SeedingService {
  private readonly logger = new Logger(SeedingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async seed(profileInput: string = 'demo'): Promise<SeedSummary> {
    const profile = this.resolveProfile(profileInput);
    this.assertSafeToSeed();

    if (!this.prisma.isReady()) {
      throw new Error(
        'Prisma is not connected. Configure DATABASE_URL and start the database before seeding.',
      );
    }

    const summary = this.createEmptySummary(profile);

    await this.seedUsers(summary);
    await this.seedCatalog(summary, profile);
    await this.seedCoupons(summary, profile);

    this.logger.log(`Seed run completed for profile \`${profile}\`.`);
    this.logger.log(JSON.stringify(summary, null, 2));

    return summary;
  }

  async seedUsers(summary: SeedSummary): Promise<void> {
    for (const fixture of SEED_LOCAL_USERS) {
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
            provider: AuthProvider.LOCAL,
            providerSubject,
          },
        },
      });

      await this.prisma.authIdentity.upsert({
        where: {
          provider_providerSubject: {
            provider: AuthProvider.LOCAL,
            providerSubject,
          },
        },
        create: {
          userId: user.id,
          provider: AuthProvider.LOCAL,
          providerSubject,
        },
        update: {
          userId: user.id,
        },
      });
      this.bump(summary.authIdentities, Boolean(existingIdentity));
    }
  }

  async seedCatalog(summary: SeedSummary, profile: SeedProfile): Promise<void> {
    const products = getSeedProducts(profile);
    const categories = this.uniqueBy(
      products.map((product) => product.category),
      (category) => category.slug,
    );
    const tags = this.uniqueBy(
      products.flatMap((product) => product.tags),
      (tag) => tag.slug,
    );

    const categoryIds = new Map<string, string>();

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

  async seedCoupons(summary: SeedSummary, profile: SeedProfile): Promise<void> {
    const coupons = buildSeedCouponFixtures(new Date(), profile);

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
          value: new Prisma.Decimal(coupon.value),
          currencyCode: coupon.currencyCode,
          minOrderAmount:
            coupon.minOrderAmount !== null
              ? new Prisma.Decimal(coupon.minOrderAmount)
              : null,
          maxDiscountAmount:
            coupon.maxDiscountAmount !== null
              ? new Prisma.Decimal(coupon.maxDiscountAmount)
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
          value: new Prisma.Decimal(coupon.value),
          currencyCode: coupon.currencyCode,
          minOrderAmount:
            coupon.minOrderAmount !== null
              ? new Prisma.Decimal(coupon.minOrderAmount)
              : null,
          maxDiscountAmount:
            coupon.maxDiscountAmount !== null
              ? new Prisma.Decimal(coupon.maxDiscountAmount)
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

  private async seedProduct(
    summary: SeedSummary,
    product: SeedProductFixture,
    categoryIds: Map<string, string>,
  ): Promise<void> {
    const existingProduct = await this.prisma.product.findUnique({
      where: { slug: product.slug },
    });

    const savedProduct = await this.prisma.product.upsert({
      where: { slug: product.slug },
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description ?? null,
        status: product.status ?? ProductStatus.DRAFT,
        isFeatured: product.isFeatured ?? false,
        categoryId: categoryIds.get(product.category.slug) ?? null,
        imageUrl: product.imageUrl ?? null,
      },
      update: {
        name: product.name,
        description: product.description ?? null,
        status: product.status ?? ProductStatus.DRAFT,
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
            amount: new Prisma.Decimal(price.amount),
            compareAtAmount:
              price.compareAtAmount !== null &&
              price.compareAtAmount !== undefined
                ? new Prisma.Decimal(price.compareAtAmount)
                : null,
          },
          update: {
            amount: new Prisma.Decimal(price.amount),
            compareAtAmount:
              price.compareAtAmount !== null &&
              price.compareAtAmount !== undefined
                ? new Prisma.Decimal(price.compareAtAmount)
                : null,
          },
        });
        this.bump(summary.prices, Boolean(existingPrice));
      }
    }
  }

  private createEmptySummary(profile: SeedProfile): SeedSummary {
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

  private createRunStat(): SeedRunStat {
    return {
      created: 0,
      updated: 0,
    };
  }

  private bump(stat: SeedRunStat, alreadyExists: boolean): void {
    if (alreadyExists) {
      stat.updated += 1;
      return;
    }

    stat.created += 1;
  }

  private assertSafeToSeed(): void {
    const nodeEnv = (process.env.NODE_ENV ?? 'development').toLowerCase();
    const allowProduction =
      (process.env.ALLOW_SEED_IN_PRODUCTION ?? 'false').toLowerCase() === 'true';

    if (nodeEnv === 'production' && !allowProduction) {
      throw new Error(
        'Data seeding is disabled in production unless explicitly allowed.',
      );
    }
  }

  private resolveProfile(profileInput?: string): SeedProfile {
    const normalized = (profileInput ?? 'demo').trim().toLowerCase();

    if (normalized === 'minimal' || normalized === 'demo') {
      return normalized;
    }

    throw new Error(
      `Unsupported seed profile \`${profileInput}\`. Use \`minimal\` or \`demo\`.`,
    );
  }

  private mapRole(role: AppRole): Role {
    return role === AppRole.ADMIN ? Role.ADMIN : Role.CUSTOMER;
  }

  private uniqueBy<T>(items: T[], keySelector: (item: T) => string): T[] {
    const seen = new Map<string, T>();

    for (const item of items) {
      seen.set(keySelector(item), item);
    }

    return [...seen.values()];
  }
}
