import 'server-only';

import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS, FALLBACK_TAGS, createEmptyCart } from './fallback-data';
import type {
  AuthTokenResponse,
  AuthenticatedUser,
  CartView,
  CatalogListResponse,
  CatalogProductView,
  HostedCheckoutSessionView,
  LoginInput,
  OrderListResponse,
} from './types';

const DEFAULT_API_BASE_URL = 'http://localhost:3000/api/v1';

function getApiBaseUrl(): string {
  return process.env.AURA_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

type AuraFetchOptions<T> = RequestInit & {
  authToken?: string;
  fallback?: () => T;
};

async function readErrorDetail(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
      const payload = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(payload.message)) {
        return payload.message.join(', ');
      }

      if (payload.message) {
        return payload.message;
      }
    }

    return await response.text();
  } catch {
    return response.statusText || 'Unknown Aura API error';
  }
}

async function auraFetch<T>(path: string, options: AuraFetchOptions<T> = {}): Promise<T> {
  const { authToken, fallback, headers, ...rest } = options;

  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...rest,
      cache: authToken || rest.method ? 'no-store' : 'force-cache',
      headers: {
        ...(rest.body ? { 'Content-Type': 'application/json' } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...headers,
      },
    });

    if (!response.ok) {
      const detail = await readErrorDetail(response);
      throw new Error(`${response.status} ${detail}`.trim());
    }

    return (await response.json()) as T;
  } catch (error) {
    if (fallback) {
      console.warn(`[storefront] Falling back for ${path}:`, error);
      return fallback();
    }

    throw error;
  }
}

export async function getCatalogProducts(): Promise<CatalogListResponse> {
  return auraFetch<CatalogListResponse>('/catalog/products', {
    fallback: () => ({ items: FALLBACK_PRODUCTS, total: FALLBACK_PRODUCTS.length }),
  });
}

export async function getProductBySlug(slug: string): Promise<CatalogProductView> {
  return auraFetch<CatalogProductView>(`/catalog/products/${encodeURIComponent(slug)}`, {
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
  return auraFetch('/catalog/categories', {
    fallback: () => FALLBACK_CATEGORIES,
  });
}

export async function getTags() {
  return auraFetch('/catalog/tags', {
    fallback: () => FALLBACK_TAGS,
  });
}

export async function loginWithPassword(input: LoginInput): Promise<AuthTokenResponse> {
  return auraFetch<AuthTokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getProfile(authToken: string): Promise<AuthenticatedUser | null> {
  try {
    return await auraFetch<AuthenticatedUser>('/auth/profile', {
      authToken,
    });
  } catch (error) {
    console.warn('[storefront] Unable to load Aura profile:', error);
    return null;
  }
}

export async function getCart(authToken: string, userId = 'customer-local'): Promise<CartView> {
  return auraFetch<CartView>('/cart', {
    authToken,
    fallback: () => createEmptyCart(userId),
  });
}

export async function addCartItem(
  authToken: string,
  payload: { sku: string; quantity: number; currencyCode?: string },
): Promise<CartView> {
  return auraFetch<CartView>('/cart/items', {
    method: 'POST',
    authToken,
    body: JSON.stringify(payload),
  });
}

export async function updateCartItem(
  authToken: string,
  sku: string,
  payload: { quantity: number },
): Promise<CartView> {
  return auraFetch<CartView>(`/cart/items/${encodeURIComponent(sku)}`, {
    method: 'PATCH',
    authToken,
    body: JSON.stringify(payload),
  });
}

export async function removeCartItem(authToken: string, sku: string): Promise<CartView> {
  return auraFetch<CartView>(`/cart/items/${encodeURIComponent(sku)}`, {
    method: 'DELETE',
    authToken,
  });
}

export async function createCheckoutSession(
  authToken: string,
  payload: { couponCode?: string; successUrl?: string; cancelUrl?: string },
): Promise<HostedCheckoutSessionView> {
  return auraFetch<HostedCheckoutSessionView>('/checkout/session', {
    method: 'POST',
    authToken,
    body: JSON.stringify(payload),
  });
}

export async function getOrderHistory(authToken: string): Promise<OrderListResponse> {
  return auraFetch<OrderListResponse>('/orders/me', {
    authToken,
    fallback: () => ({ items: [], total: 0 }),
  });
}
