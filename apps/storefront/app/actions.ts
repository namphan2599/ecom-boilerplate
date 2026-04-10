'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  addCartItem,
  createCheckoutSession,
  removeCartItem,
  updateCartItem,
} from '@/lib/aura/client';
import { requireSession } from '@/lib/auth/session';

const STOREFRONT_URL =
  process.env.NEXT_PUBLIC_STOREFRONT_URL ?? 'http://localhost:3001';

function getRedirectErrorUrl(path: string, message: string): string {
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}error=${encodeURIComponent(message)}`;
}

export async function addToCartAction(formData: FormData): Promise<void> {
  const sku = String(formData.get('sku') ?? '');
  const quantity = Math.max(1, Number(formData.get('quantity') ?? 1));
  const currencyCode = String(formData.get('currencyCode') ?? 'USD');
  const returnPath = String(formData.get('returnPath') ?? '/cart');

  if (!sku) {
    redirect(getRedirectErrorUrl(returnPath, 'A product SKU is required.'));
  }

  const session = await requireSession(returnPath);

  try {
    await addCartItem(session.token, { sku, quantity, currencyCode });
    revalidatePath('/cart');
    revalidatePath('/checkout');
    redirect('/cart?added=1');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to add the item to the cart.';
    redirect(getRedirectErrorUrl(returnPath, message));
  }
}

export async function updateCartQuantityAction(formData: FormData): Promise<void> {
  const sku = String(formData.get('sku') ?? '');
  const quantity = Math.max(0, Number(formData.get('quantity') ?? 1));
  const session = await requireSession('/cart');

  try {
    await updateCartItem(session.token, sku, { quantity });
    revalidatePath('/cart');
    revalidatePath('/checkout');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update the cart item.';
    redirect(getRedirectErrorUrl('/cart', message));
  }
}

export async function removeCartItemAction(formData: FormData): Promise<void> {
  const sku = String(formData.get('sku') ?? '');
  const session = await requireSession('/cart');

  try {
    await removeCartItem(session.token, sku);
    revalidatePath('/cart');
    revalidatePath('/checkout');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to remove the cart item.';
    redirect(getRedirectErrorUrl('/cart', message));
  }
}

export async function startCheckoutAction(formData: FormData): Promise<void> {
  const couponCode = String(formData.get('couponCode') ?? '').trim() || undefined;
  const session = await requireSession('/checkout');

  try {
    const result = await createCheckoutSession(session.token, {
      couponCode,
      successUrl: `${STOREFRONT_URL}/checkout/success`,
      cancelUrl: `${STOREFRONT_URL}/checkout/cancel`,
    });

    revalidatePath('/account/orders');
    redirect(result.checkoutUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to start checkout.';
    redirect(getRedirectErrorUrl('/checkout', message));
  }
}
