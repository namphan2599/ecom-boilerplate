'use client';

import { createContext, useContext, useState, useEffect, useCallback, useSyncExternalStore, type ReactNode } from 'react';
import { addCartItem as addCartItemApi, getCart } from '@/lib/cart';
import type { CartView } from '@/lib/types';

interface CartContextValue {
  cart: CartView | null;
  isLoading: boolean;
  totalCount: number;
  refetch: () => Promise<void>;
  addToCart: (payload: { sku: string; quantity: number; currencyCode?: string }) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

function usePathnameStore() {
  return useSyncExternalStore(
    () => () => {},
    () => window.location.pathname,
    () => '',
  );
}

async function getAuthTokenClient(): Promise<string | null> {
  const match = document.cookie.match(/(?:^|; )\s*aura_access_token\s*=\s*([^;]+)/);
  return match ? match[1] : null;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathnameStore();

  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await getAuthTokenClient();
      if (!token) {
        setCart(null);
        setIsLoading(false);
        return;
      }
      const data = await getCart(token);
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [pathname]);

  const addToCart = useCallback(async (payload: { sku: string; quantity: number; currencyCode?: string }) => {
    const token = await getAuthTokenClient();
    if (!token) return;
    const data = await addCartItemApi(token, payload);
    setCart(data);
  }, []);

  const totalCount = cart?.summary.itemCount ?? 0;

  return (
    <CartContext.Provider value={{ cart, isLoading, totalCount, refetch: fetchCart, addToCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}