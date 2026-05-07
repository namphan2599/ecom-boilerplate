import { getAuthToken } from '@/lib/auth/session';
import { getCart } from '@/lib/aura/client';
import { NextResponse } from 'next/server';

export async function GET() {
  const token = await getAuthToken();
  
  if (!token) {
    return NextResponse.json({ items: [], summary: { itemCount: 0 } });
  }

  try {
    const cart = await getCart(token);
    return NextResponse.json(cart);
  } catch {
    return NextResponse.json({ items: [], summary: { itemCount: 0 } });
  }
}