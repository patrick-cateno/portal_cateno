export { auth as middleware } from '@/lib/auth';

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - Health endpoint (uses Bearer token, not NextAuth session)
     * - API tools register (allows service account auth)
     * - Static files and Next.js internals
     * - Public assets
     */
    '/((?!api/applications/[^/]+/health|api/tools|_next/static|_next/image|favicon\\.ico).*)',
  ],
};
