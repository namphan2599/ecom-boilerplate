import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/aura/client';
import type { StorefrontSession } from '@/lib/aura/types';

export const ACCESS_TOKEN_COOKIE = 'aura_access_token';

export function buildAuthCookieOptions(maxAge = 60 * 60): {
  httpOnly: boolean;
  sameSite: 'lax';
  secure: boolean;
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  };
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getSession(): Promise<StorefrontSession | null> {
  const token = await getAuthToken();
  if (!token) {
    return null;
  }

  const user = await getProfile(token);
  if (!user) {
    return null;
  }

  return { token, user };
}

export async function requireSession(nextPath: string): Promise<StorefrontSession> {
  const session = await getSession();

  if (!session) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return session;
}
