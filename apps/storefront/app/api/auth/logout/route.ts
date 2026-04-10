import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_TOKEN_COOKIE, buildAuthCookieOptions } from '@/lib/auth/session';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.redirect(new URL('/', request.url));
  response.cookies.set(ACCESS_TOKEN_COOKIE, '', {
    ...buildAuthCookieOptions(0),
    maxAge: 0,
  });
  return response;
}
