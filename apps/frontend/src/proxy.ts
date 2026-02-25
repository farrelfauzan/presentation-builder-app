import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

async function hasGlobalSettings(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/global-settings`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.ok;
  } catch {
    // If backend is unreachable, allow through to avoid blocking
    return true;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect root to dashboard/projects
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard/projects', request.url));
  }

  // Redirect /dashboard to /dashboard/projects
  if (pathname === '/dashboard') {
    return NextResponse.redirect(new URL('/dashboard/projects', request.url));
  }

  // On /setup, if settings already exist, redirect to dashboard
  if (pathname === '/setup') {
    const exists = await hasGlobalSettings();
    if (exists) {
      return NextResponse.redirect(new URL('/dashboard/projects', request.url));
    }
    return NextResponse.next();
  }

  // On dashboard routes, check if global settings exist
  if (pathname.startsWith('/dashboard')) {
    const exists = await hasGlobalSettings();
    if (!exists) {
      return NextResponse.redirect(new URL('/setup', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/setup'],
};
