import { NextRequest, NextResponse } from 'next/server';
import { loginWithPassword } from '@/lib/aura/client';
import { ACCESS_TOKEN_COOKIE, buildAuthCookieOptions } from '@/lib/auth/session';

function safeNextPath(nextPath: string | null | undefined): string {
  if (!nextPath || !nextPath.startsWith('/')) {
    return '/products';
  }

  return nextPath;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const contentType = request.headers.get('content-type') ?? '';
  const wantsJson = contentType.includes('application/json');

  let email = '';
  let password = '';
  let nextPath = '/products';

  if (wantsJson) {
    const payload = (await request.json()) as {
      email?: string;
      password?: string;
      next?: string;
    };

    email = payload.email ?? '';
    password = payload.password ?? '';
    nextPath = safeNextPath(payload.next);
  } else {
    const formData = await request.formData();
    email = String(formData.get('email') ?? '');
    password = String(formData.get('password') ?? '');
    nextPath = safeNextPath(String(formData.get('next') ?? '/products'));
  }

  try {
    const result = await loginWithPassword({ email, password });
    const response = wantsJson
      ? NextResponse.json({ user: result.user })
      : NextResponse.redirect(new URL(nextPath, request.url));

    response.cookies.set(
      ACCESS_TOKEN_COOKIE,
      result.accessToken,
      buildAuthCookieOptions(),
    );

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed.';

    if (wantsJson) {
      return NextResponse.json({ message }, { status: 401 });
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', message);
    loginUrl.searchParams.set('next', nextPath);
    return NextResponse.redirect(loginUrl);
  }
}
