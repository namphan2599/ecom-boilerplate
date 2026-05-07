'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useCart } from '@/lib/cart/context';

function FlyingItem({
  startPosition,
  endPosition,
  onComplete,
}: {
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  onComplete: () => void;
}) {
  const [position, setPosition] = useState(startPosition);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const startTime = performance.now();
    const duration = 600;

    let animationFrame: number;

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const currentX = startPosition.x + (endPosition.x - startPosition.x) * easeOut;
      const currentY = startPosition.y + (endPosition.y - startPosition.y) * easeOut;

      setPosition({ x: currentX, y: currentY });
      setScale(1 - 0.5 * easeOut);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else {
        onComplete();
      }
    };

    animationFrame = requestAnimationFrame(step);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [startPosition, endPosition, onComplete]);

  return (
    <div
      className="fixed z-50 flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-white"
      style={{
        left: position.x,
        top: position.y,
        transform: `translate(-50%, -50%) scale(${scale})`,
        pointerEvents: 'none',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    </div>
  );
}

interface AddToCartButtonProps {
  sku: string;
  quantity: number;
  currencyCode?: string;
  children: React.ReactNode;
}

export function AddToCartButton({ sku, quantity, currencyCode = 'USD', children }: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const [pending, setPending] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [flyingPosition, setFlyingPosition] = useState<{
    start: { x: number; y: number };
    end: { x: number; y: number };
  } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback(async () => {
    if (pending || !buttonRef.current) return;

    const cartButton = document.querySelector('[data-cart-button]');
    if (!cartButton) return;

    setPending(true);

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const cartRect = cartButton.getBoundingClientRect();

    setFlyingPosition({
      start: { x: buttonRect.left + buttonRect.width / 2, y: buttonRect.top + buttonRect.height / 2 },
      end: { x: cartRect.left + cartRect.width / 2, y: cartRect.top + cartRect.height / 2 },
    });
    setShowAnimation(true);

    await addToCart({ sku, quantity, currencyCode });
    setPending(false);
  }, [pending, sku, quantity, currencyCode, addToCart]);

  const handleComplete = useCallback(() => {
    setShowAnimation(false);
    setFlyingPosition(null);
  }, []);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled={pending}
        className="relative w-full overflow-hidden rounded-pill bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
        onClick={handleClick}
      >
        <span className={pending ? 'opacity-0' : ''}>{children}</span>
        {pending && (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </span>
        )}
      </button>
      {showAnimation && flyingPosition && (
        <FlyingItem
          startPosition={flyingPosition.start}
          endPosition={flyingPosition.end}
          onComplete={handleComplete}
        />
      )}
    </>
  );
}