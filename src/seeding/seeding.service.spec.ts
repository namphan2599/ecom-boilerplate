import { beforeEach, describe, expect, it } from '@jest/globals';
import {
  AuthProvider,
  CouponType,
  ProductStatus,
  Role,
} from '@prisma/client';
import { SeedingService } from './seeding.service';

type UserRecord = {
  id: string;
  email: string;
  passwordHash: string | null;
  firstName: string | null;
  lastName: string | null;
  role: Role;
  isActive: boolean;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type AuthIdentityRecord = {
  id: string;
  userId: string;
  provider: AuthProvider;
  providerSubject: string;
  createdAt: Date;
  updatedAt: Date;
};

type CategoryRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

type TagRecord = {
  id: string;
  name: string;
  slug: string;
};

type ProductRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: ProductStatus;
  isFeatured: boolean;
  categoryId: string | null;
  imageUrl: string | null;
  imageKey: string | null;
  tagSlugs: string[];
};

type ProductVariantRecord = {
  id: string;
  productId: string;
  sku: string;
  title: string;
  attributes: Record<string, string>;
  inventoryOnHand: number;
  inventoryReserved: number;
  isActive: boolean;
};

type ProductPriceRecord = {
  id: string;
  variantId: string;
  currencyCode: string;
  amount: number;
  compareAtAmount: number | null;
};

type CouponRecord = {
  id: string;
  code: string;
  description: string | null;
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
};

function createMockPrisma() {
  let idCounter = 1;
  const nextId = (prefix: string) => `${prefix}-${idCounter++}`;

  const users = new Map<string, UserRecord>();
  const identities = new Map<string, AuthIdentityRecord>();
  const categories = new Map<string, CategoryRecord>();
  const tags = new Map<string, TagRecord>();
  const products = new Map<string, ProductRecord>();
  const variants = new Map<string, ProductVariantRecord>();
  const prices = new Map<string, ProductPriceRecord>();
  const coupons = new Map<string, CouponRecord>();

  return {
    isReady: () => true,
    user: {
      findUnique: async ({ where }: { where: { email: string } }) => users.get(where.email) ?? null,
      upsert: async ({ where, create, update }: { where: { email: string }; create: Partial<UserRecord> & { email: string; role: Role }; update: Partial<UserRecord> }) => {
        const existing = users.get(where.email);
        const now = new Date();
        const record: UserRecord = existing
          ? { ...existing, ...update, updatedAt: now }
          : {
              id: (create.id as string | undefined) ?? nextId('user'),
              email: create.email,
              passwordHash: (create.passwordHash as string | null | undefined) ?? null,
              firstName: (create.firstName as string | null | undefined) ?? null,
              lastName: (create.lastName as string | null | undefined) ?? null,
              role: create.role,
              isActive: (create.isActive as boolean | undefined) ?? true,
              emailVerifiedAt: (create.emailVerifiedAt as Date | null | undefined) ?? null,
              createdAt: now,
              updatedAt: now,
            };
        users.set(where.email, record);
        return record;
      },
    },
    authIdentity: {
      findUnique: async ({ where }: { where: { provider_providerSubject: { provider: AuthProvider; providerSubject: string } } }) => identities.get(`${where.provider_providerSubject.provider}:${where.provider_providerSubject.providerSubject}`) ?? null,
      upsert: async ({ where, create, update }: { where: { provider_providerSubject: { provider: AuthProvider; providerSubject: string } }; create: Omit<AuthIdentityRecord, 'createdAt' | 'updatedAt'>; update: Partial<AuthIdentityRecord> }) => {
        const key = `${where.provider_providerSubject.provider}:${where.provider_providerSubject.providerSubject}`;
        const existing = identities.get(key);
        const now = new Date();
        const record: AuthIdentityRecord = existing
          ? { ...existing, ...update, updatedAt: now }
          : { ...create, createdAt: now, updatedAt: now };
        identities.set(key, record);
        return record;
      },
    },
    category: {
      findUnique: async ({ where }: { where: { slug: string } }) => categories.get(where.slug) ?? null,
      upsert: async ({ where, create, update }: { where: { slug: string }; create: Omit<CategoryRecord, 'id'>; update: Partial<CategoryRecord> }) => {
        const existing = categories.get(where.slug);
        const record: CategoryRecord = existing
          ? { ...existing, ...update }
          : { id: nextId('category'), ...create };
        categories.set(where.slug, record);
        return record;
      },
    },
    tag: {
      findUnique: async ({ where }: { where: { slug: string } }) => tags.get(where.slug) ?? null,
      upsert: async ({ where, create, update }: { where: { slug: string }; create: Omit<TagRecord, 'id'>; update: Partial<TagRecord> }) => {
        const existing = tags.get(where.slug);
        const record: TagRecord = existing ? { ...existing, ...update } : { id: nextId('tag'), ...create };
        tags.set(where.slug, record);
        return record;
      },
    },
    product: {
      findUnique: async ({ where }: { where: { slug: string } }) => products.get(where.slug) ?? null,
      upsert: async ({ where, create, update }: { where: { slug: string }; create: Omit<ProductRecord, 'id' | 'tagSlugs'> & { tags?: { connect: Array<{ slug: string }> } }; update: Partial<ProductRecord> & { tags?: { set?: []; connect?: Array<{ slug: string }> } } }) => {
        const existing = products.get(where.slug);
        const record: ProductRecord = existing
          ? {
              ...existing,
              ...update,
              tagSlugs: update.tags?.connect?.map((tag) => tag.slug) ?? existing.tagSlugs,
            }
          : {
              id: nextId('product'),
              name: create.name,
              slug: create.slug,
              description: create.description ?? null,
              status: create.status,
              isFeatured: create.isFeatured,
              categoryId: create.categoryId ?? null,
              imageUrl: create.imageUrl ?? null,
              imageKey: create.imageKey ?? null,
              tagSlugs: create.tags?.connect?.map((tag) => tag.slug) ?? [],
            };
        products.set(where.slug, record);
        return record;
      },
      update: async ({ where, data }: { where: { slug: string }; data: { tags?: { set?: []; connect?: Array<{ slug: string }> } } }) => {
        const existing = products.get(where.slug);
        if (!existing) {
          throw new Error(`Unknown product ${where.slug}`);
        }
        const updated: ProductRecord = {
          ...existing,
          tagSlugs: data.tags?.connect?.map((tag) => tag.slug) ?? [],
        };
        products.set(where.slug, updated);
        return updated;
      },
    },
    productVariant: {
      findUnique: async ({ where }: { where: { sku: string } }) => variants.get(where.sku) ?? null,
      upsert: async ({ where, create, update }: { where: { sku: string }; create: Omit<ProductVariantRecord, 'id'>; update: Partial<ProductVariantRecord> }) => {
        const existing = variants.get(where.sku);
        const record: ProductVariantRecord = existing
          ? { ...existing, ...update }
          : { id: nextId('variant'), ...create };
        variants.set(where.sku, record);
        return record;
      },
    },
    productVariantPrice: {
      findUnique: async ({ where }: { where: { variantId_currencyCode: { variantId: string; currencyCode: string } } }) => prices.get(`${where.variantId_currencyCode.variantId}:${where.variantId_currencyCode.currencyCode}`) ?? null,
      upsert: async ({ where, create, update }: { where: { variantId_currencyCode: { variantId: string; currencyCode: string } }; create: Omit<ProductPriceRecord, 'id'>; update: Partial<ProductPriceRecord> }) => {
        const key = `${where.variantId_currencyCode.variantId}:${where.variantId_currencyCode.currencyCode}`;
        const existing = prices.get(key);
        const record: ProductPriceRecord = existing
          ? { ...existing, ...update }
          : { id: nextId('price'), ...create };
        prices.set(key, record);
        return record;
      },
    },
    coupon: {
      findUnique: async ({ where }: { where: { code: string } }) => coupons.get(where.code) ?? null,
      upsert: async ({ where, create, update }: { where: { code: string }; create: Omit<CouponRecord, 'id' | 'createdAt' | 'updatedAt'>; update: Partial<CouponRecord> }) => {
        const existing = coupons.get(where.code);
        const now = new Date();
        const record: CouponRecord = existing
          ? { ...existing, ...update, updatedAt: now }
          : { id: nextId('coupon'), ...create, createdAt: now, updatedAt: now };
        coupons.set(where.code, record);
        return record;
      },
    },
    __stores: {
      users,
      identities,
      categories,
      tags,
      products,
      variants,
      prices,
      coupons,
    },
  };
}

describe('SeedingService', () => {
  let previousNodeEnv: string | undefined;

  beforeEach(() => {
    previousNodeEnv = process.env.NODE_ENV;
    delete process.env.ALLOW_SEED_IN_PRODUCTION;
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    process.env.NODE_ENV = previousNodeEnv;
    delete process.env.ALLOW_SEED_IN_PRODUCTION;
  });

  it('seeds the demo profile and stays idempotent on repeat runs', async () => {
    const prisma = createMockPrisma();
    const service = new SeedingService(prisma as never);

    const firstRun = await service.seed('demo');
    const secondRun = await service.seed('demo');

    expect(firstRun.users.created).toBe(2);
    expect(firstRun.products.created).toBeGreaterThanOrEqual(2);
    expect(firstRun.coupons.created).toBeGreaterThanOrEqual(2);

    expect(secondRun.users.created).toBe(0);
    expect(secondRun.users.updated).toBe(2);
    expect(secondRun.products.created).toBe(0);
    expect(secondRun.products.updated).toBeGreaterThanOrEqual(2);

    expect(prisma.__stores.users.size).toBe(2);
    expect(prisma.__stores.products.size).toBeGreaterThanOrEqual(2);
    expect(prisma.__stores.coupons.has('AURA20')).toBe(true);
  });

  it('supports a minimal profile with a reduced fixture set', async () => {
    const prisma = createMockPrisma();
    const service = new SeedingService(prisma as never);

    const summary = await service.seed('minimal');

    expect(summary.profile).toBe('minimal');
    expect(summary.products.created).toBe(1);
    expect(summary.coupons.created).toBe(1);
    expect(prisma.__stores.products.size).toBe(1);
    expect(prisma.__stores.coupons.size).toBe(1);
  });

  it('blocks production seeding unless explicitly allowed', async () => {
    const prisma = createMockPrisma();
    const service = new SeedingService(prisma as never);

    process.env.NODE_ENV = 'production';

    await expect(service.seed('demo')).rejects.toThrow(
      'Data seeding is disabled in production unless explicitly allowed.',
    );
  });
});
