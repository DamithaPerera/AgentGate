import { auth0 } from './lib/auth0';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  return await auth0.middleware(request);
}

export const config = {
  matcher: [
    // Run Auth0 middleware on all routes EXCEPT static files and API routes
    // API routes handle their own auth via Bearer token (withAuth / resolveAuth)
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/).*)',
  ],
};
