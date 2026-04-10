import { describe, expect, it } from 'vitest';
import { FALLBACK_PRODUCTS } from '@/lib/aura/fallback-data';
import { filterProducts, getPrimaryPrice, toProductCard } from '@/lib/aura/mappers';

describe('storefront data mappers', () => {
  it('maps a catalog product into a product card model', () => {
    const card = toProductCard(FALLBACK_PRODUCTS[0]);

    expect(card.slug).toBe('aura-signature-hoodie');
    expect(card.priceAmount).toBeGreaterThan(0);
    expect(card.categoryLabel).toBe('Apparel');
  });

  it('filters products by keyword and category', () => {
    const apparel = filterProducts(FALLBACK_PRODUCTS, 'hoodie', 'apparel');

    expect(apparel).toHaveLength(1);
    expect(apparel[0].slug).toBe('aura-signature-hoodie');
  });

  it('selects the preferred currency price when available', () => {
    const price = getPrimaryPrice(FALLBACK_PRODUCTS[0], 'EUR');

    expect(price.currencyCode).toBe('EUR');
    expect(price.amount).toBe(74.99);
  });
});
