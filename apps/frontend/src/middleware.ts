import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect root to dashboard/projects
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard/projects', request.url));
  }

  // Redirect /dashboard to /dashboard/projects
  if (pathname === '/dashboard') {
    return NextResponse.redirect(new URL('/dashboard/projects', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard'],
};
