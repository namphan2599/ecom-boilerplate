'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { CartView } from '@/lib/aura/types';

type CartContextType = {
  cart: CartView | null;
  isLoading: boolean;
  totalCount: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children, initialCart }: { children: ReactNode; initialCart?: CartView | null }) {
  const [cart, setCart] = useState<CartView | null>(initialCart ?? null);
  const [isLoading] = useState(!initialCart);

  const totalCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <CartContext.Provider value={{ cart, isLoading, totalCount }}>
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