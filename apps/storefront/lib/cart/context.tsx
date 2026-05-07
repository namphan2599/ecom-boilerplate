'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { CartView, CartItemView } from '@/lib/aura/types';

interface CartContextValue {
  cart: CartView | null;
  isLoading: boolean;
  totalCount: number;
  refetch: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartView | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/cart', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = (await res.json()) as CartView;
        setCart(data);
      }
    } catch {
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const totalCount = cart?.summary.itemCount ?? 0;

  return (
    <CartContext.Provider value={{ cart, isLoading, totalCount, refetch: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}