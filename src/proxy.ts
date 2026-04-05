import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.AUTH_SECRET;

const PUBLIC_PATHS = ['/login', '/api/auth', '/demo', '/api/tools'];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) return true;
  // Health endpoint uses Bearer token, not NextAuth session
  if (/^\/api\/applications\/[^/]+\/health$/.test(pathname)) return true;
  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (isPublicPath(pathname)) {
    // If user is authenticated and visits /login, redirect to /aplicacoes
    if (pathname.startsWith('/login')) {
      const token = await getToken({ req: request, secret });
      if (token && !token.error) {
        return NextResponse.redirect(new URL('/aplicacoes', request.url));
      }
    }
    return NextResponse.next();
  }

  // Check for valid session token
  const token = await getToken({ req: request, secret });

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If token has refresh error, force re-authentication
  if (token.error === 'RefreshAccessTokenError') {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'SessionExpired');
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
};
