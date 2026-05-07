'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart/context';

function BagIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

export function CartButton() {
  const { cart, totalCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        data-cart-button
        onMouseEnter={() => setIsOpen(true)}
        className="relative flex items-center justify-center rounded-full p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        aria-label={`Shopping bag with ${totalCount} items`}
      >
        <BagIcon className="h-5 w-5" />
        {totalCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-xs font-medium text-white">
            {totalCount > 99 ? '99+' : totalCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Shopping Bag</h3>
          
          {(!cart?.items || cart.items.length === 0) ? (
            <p className="text-sm text-slate-500">Your bag is empty</p>
          ) : (
            <ul className="max-h-64 space-y-3 overflow-y-auto">
              {cart.items.slice(0, 5).map((item) => (
                <li key={item.sku} className="flex gap-3">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-slate-100" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{item.productName}</p>
                    <p className="text-sm text-slate-500">
                      {item.quantity} × {item.currencyCode} {item.unitPrice.toFixed(2)}
                    </p>
                  </div>
                </li>
              ))}
              {cart.items.length > 5 && (
                <li className="text-sm text-slate-500">+{cart.items.length - 5} more items</li>
              )}
            </ul>
          )}
          
          {cart?.items && cart.items.length > 0 && (
            <Link
              href="/cart"
              className="mt-3 block w-full rounded-full bg-slate-950 py-2 text-center text-sm font-medium text-white transition hover:bg-slate-800"
            >
              View Bag ({totalCount})
            </Link>
          )}
        </div>
      )}
    </div>
  );
}