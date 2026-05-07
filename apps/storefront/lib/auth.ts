
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { apiFetch } from './client';
import type { StorefrontSession, AuthTokenResponse, LoginInput, RegisterInput, AuthenticatedUser } from './types';

export const ACCESS_TOKEN_COOKIE = 'aura_access_token';

export function buildAuthCookieOptions(maxAge = 60 * 60) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
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
  if (!token) return null;

  const user = await getProfile(token);
  if (!user) return null;

  return { token, user };
}

export async function requireSession(nextPath: string): Promise<StorefrontSession> {
  const session = await getSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  return session;
}

export async function loginWithPassword(input: LoginInput): Promise<AuthTokenResponse> {
  return apiFetch<AuthTokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function registerWithPassword(input: RegisterInput): Promise<AuthTokenResponse> {
  return apiFetch<AuthTokenResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getProfile(authToken: string): Promise<AuthenticatedUser | null> {
  try {
    return await apiFetch<AuthenticatedUser>('/auth/profile', { authToken });
  } catch (error) {
    console.warn('[storefront] Unable to load profile:', error);
    return null;
  }
}