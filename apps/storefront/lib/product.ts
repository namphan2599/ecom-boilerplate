import 'server-only';
import { apiFetch } from './client';
import { FALLBACK_PRODUCTS, FALLBACK_CATEGORIES, FALLBACK_TAGS } from './fallback';
import type { CatalogListResponse, CatalogProductView } from './types';

export async function getCatalogProducts(): Promise<CatalogListResponse> {
  return apiFetch<CatalogListResponse>('/catalog/products', {
    fallback: () => ({ items: FALLBACK_PRODUCTS, total: FALLBACK_PRODUCTS.length }),
  });
}

export async function getProductBySlug(slug: string): Promise<CatalogProductView> {
  return apiFetch<CatalogProductView>(`/catalog/products/${encodeURIComponent(slug)}`, {
    fallback: () => {
      const product = FALLBACK_PRODUCTS.find((item) => item.slug === slug);
      if (!product) {
        throw new Error(`Product ${slug} was not found.`);
      }
      return product;
    },
  });
}

export async function getCategories() {
  return apiFetch('/catalog/categories', {
    fallback: () => FALLBACK_CATEGORIES,
  });
}

export async function getTags() {
  return apiFetch('/catalog/tags', {
    fallback: () => FALLBACK_TAGS,
  });
}