import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths that don't need auth
  const publicPaths = [
    '/auth/login',
    '/auth/signup',
    '/auth/verify-email',
    '/auth/reset-password',
    '/experiences',
    '/',
  ];

  // API routes that don't need auth (public endpoints)
  const publicApiPaths = [
    '/api/auth/login',
    '/api/auth/signup',
    '/api/auth/verify-email',
    '/api/auth/reset-password',
    '/api/experiences',
    '/api/dashboard/stats',
  ];

  // Skip middleware for public paths
  if (publicPaths.some((path) => pathname === path || pathname.startsWith(path + '/'))) {
    return NextResponse.next();
  }

  // Skip middleware for public API paths
  if (publicApiPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token
  const user = verifyToken(token);
  if (!user) {
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control
  const adminPaths = ['/admin'];
  const agencyPaths = ['/agency'];
  const customerPaths = ['/customer'];

  const url = request.nextUrl;

  if (adminPaths.some((path) => url.pathname.startsWith(path))) {
    if (user.role !== 'ADMIN') {
      const dashboardUrl = new URL('/customer/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  if (agencyPaths.some((path) => url.pathname.startsWith(path))) {
    if (user.role !== 'AGENCY' && user.role !== 'ADMIN') {
      const dashboardUrl = new URL('/customer/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  if (customerPaths.some((path) => url.pathname.startsWith(path))) {
    if (user.role !== 'CUSTOMER' && user.role !== 'ADMIN' && user.role !== 'AGENCY') {
      const dashboardUrl = new URL('/auth/login', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // Add user info to headers for API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', user.id);
  requestHeaders.set('x-user-email', user.email);
  requestHeaders.set('x-user-role', user.role);
  requestHeaders.set('x-user-name', `${user.firstName} ${user.lastName}`);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)).*)',
  ],
};
