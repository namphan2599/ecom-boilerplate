import 'server-only';
import { apiFetch } from './client';
import type { OrderListResponse } from './types';

export async function getOrderHistory(authToken: string): Promise<OrderListResponse> {
  return apiFetch<OrderListResponse>('/orders/me', {
    authToken,
    fallback: () => ({ items: [], total: 0 }),
  });
}