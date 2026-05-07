import 'server-only';
import { apiFetch } from './client';
import type { HostedCheckoutSessionView } from './types';

export async function createCheckoutSession(
  authToken: string,
  payload: { couponCode?: string; successUrl?: string; cancelUrl?: string },
): Promise<HostedCheckoutSessionView> {
  return apiFetch<HostedCheckoutSessionView>('/checkout/session', {
    method: 'POST',
    authToken,
    body: JSON.stringify(payload),
  });
}