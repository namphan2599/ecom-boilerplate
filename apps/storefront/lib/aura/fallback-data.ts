import type {
  CartView,
  CatalogCategoryView,
  CatalogProductView,
  CatalogTagView,
} from './types';

const now = new Date().toISOString();

export const FALLBACK_CATEGORIES: CatalogCategoryView[] = [
  { id: 'cat_apparel', name: 'Apparel', slug: 'apparel' },
  { id: 'cat_accessories', name: 'Accessories', slug: 'accessories' },
];

export const FALLBACK_TAGS: CatalogTagView[] = [
  { id: 'tag_featured', name: 'Featured', slug: 'featured' },
  { id: 'tag_outerwear', name: 'Outerwear', slug: 'outerwear' },
  { id: 'tag_essentials', name: 'Essentials', slug: 'essentials' },
];

export const FALLBACK_PRODUCTS: CatalogProductView[] = [
  {
    id: 'prod_hoodie',
    name: 'Aura Signature Hoodie',
    slug: 'aura-signature-hoodie',
    description: 'Heavyweight everyday hoodie with multi-currency pricing and a relaxed fit.',
    status: 'ACTIVE',
    imageUrl: null,
    imageKey: null,
    isFeatured: true,
    category: FALLBACK_CATEGORIES[0],
    tags: [FALLBACK_TAGS[0], FALLBACK_TAGS[1]],
    variants: [
      {
        id: 'var_hoodie_blk_m',
        sku: 'HOODIE-BLK-M',
        title: 'Black / Medium',
        attributes: { color: 'Black', size: 'M' },
        inventoryOnHand: 24,
        inventoryReserved: 0,
        isActive: true,
        prices: [
          { currencyCode: 'USD', amount: 79.99, compareAtAmount: 89.99 },
          { currencyCode: 'EUR', amount: 74.99, compareAtAmount: 84.99 },
        ],
      },
    ],
  },
  {
    id: 'prod_tee',
    name: 'Aura Everyday Tee',
    slug: 'aura-everyday-tee',
    description: 'Soft cotton staple tee for daily wear and simple layering.',
    status: 'ACTIVE',
    imageUrl: null,
    imageKey: null,
    isFeatured: false,
    category: FALLBACK_CATEGORIES[0],
    tags: [FALLBACK_TAGS[2]],
    variants: [
      {
        id: 'var_tee_wht_m',
        sku: 'TEE-WHT-M',
        title: 'White / Medium',
        attributes: { color: 'White', size: 'M' },
        inventoryOnHand: 48,
        inventoryReserved: 0,
        isActive: true,
        prices: [{ currencyCode: 'USD', amount: 29.99, compareAtAmount: 34.99 }],
      },
    ],
  },
  {
    id: 'prod_cap',
    name: 'Aura Trail Cap',
    slug: 'aura-trail-cap',
    description: 'Lightweight cap with everyday embroidery and quick-dry fabric.',
    status: 'ACTIVE',
    imageUrl: null,
    imageKey: null,
    isFeatured: true,
    category: FALLBACK_CATEGORIES[1],
    tags: [FALLBACK_TAGS[0]],
    variants: [
      {
        id: 'var_cap_blk',
        sku: 'CAP-BLK-ONE',
        title: 'Black / One Size',
        attributes: { color: 'Black', size: 'One Size' },
        inventoryOnHand: 36,
        inventoryReserved: 0,
        isActive: true,
        prices: [{ currencyCode: 'USD', amount: 24.5, compareAtAmount: null }],
      },
    ],
  },
];

export function createEmptyCart(userId = 'customer-local'): CartView {
  return {
    userId,
    items: [],
    summary: {
      currencyCode: 'USD',
      itemCount: 0,
      distinctItems: 0,
      subtotal: 0,
    },
    persistence: 'memory',
    updatedAt: now,
  };
}
