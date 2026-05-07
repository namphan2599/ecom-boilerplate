import { getAuthToken } from '@/lib/auth';
import { getCart } from '@/lib/cart';
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