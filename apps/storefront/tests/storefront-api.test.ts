import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getCart, getCatalogProducts, getProductBySlug } from '@/lib/aura/client';

describe('Aura API client fallback behavior', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('returns fallback catalog data when the backend is unavailable', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('offline')) as typeof fetch;

    const result = await getCatalogProducts();

    expect(result.total).toBeGreaterThan(0);
    expect(result.items[0]?.slug).toBeTruthy();
  });

  it('returns an empty cart fallback if the cart API cannot be reached', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('offline')) as typeof fetch;

    const cart = await getCart('demo-token', 'customer-local');

    expect(cart.userId).toBe('customer-local');
    expect(cart.items).toHaveLength(0);
  });

  it('throws when a fallback product slug does not exist', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('offline')) as typeof fetch;

    await expect(getProductBySlug('missing-product')).rejects.toThrow('missing-product');
  });
});
