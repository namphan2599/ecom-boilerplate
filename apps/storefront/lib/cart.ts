import { apiFetch } from './client';
import { createEmptyCart } from './fallback';
import type { CartView } from './types';

export async function getCart(authToken: string, userId = 'customer-local'): Promise<CartView> {
  return apiFetch<CartView>('/cart', {
    authToken,
    fallback: () => createEmptyCart(userId),
  });
}

export async function addCartItem(
  authToken: string,
  payload: { sku: string; quantity: number; currencyCode?: string },
): Promise<CartView> {
  return apiFetch<CartView>('/cart/items', {
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
  return apiFetch<CartView>(`/cart/items/${encodeURIComponent(sku)}`, {
    method: 'PATCH',
    authToken,
    body: JSON.stringify(payload),
  });
}

export async function removeCartItem(authToken: string, sku: string): Promise<CartView> {
  return apiFetch<CartView>(`/cart/items/${encodeURIComponent(sku)}`, {
    method: 'DELETE',
    authToken,
  });
}