import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/login', '/register', '/api/auth'];

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const userType = request.cookies.get('userType')?.value;
  const { pathname } = request.nextUrl;

  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // 1. Unauthenticated users trying to access ANY non-public path
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Authenticated users trying to access login/register
  if (token && isPublicPath && (pathname === '/login' || pathname === '/register')) {
    const dashboard = userType === 'ADMIN' ? '/admin/dashboard' : 
                    userType === 'DOCTOR' ? '/doctor/dashboard' : '/patient';
    return NextResponse.redirect(new URL(dashboard, request.url));
  }

  // 3. Role-based protection for authenticated users
  if (token && userType) {
    // Admin path protection
    if (pathname.startsWith('/admin') && userType !== 'ADMIN') {
      const target = userType === 'DOCTOR' ? '/doctor/dashboard' : '/patient';
      return NextResponse.redirect(new URL(target, request.url));
    }

    // Doctor path protection
    if (pathname.startsWith('/doctor') && userType !== 'DOCTOR') {
      const target = userType === 'ADMIN' ? '/admin/dashboard' : '/patient';
      return NextResponse.redirect(new URL(target, request.url));
    }

    // Patient path protection
    if (pathname.startsWith('/patient') && userType !== 'PATIENT') {
      const target = userType === 'ADMIN' ? '/admin/dashboard' : '/doctor/dashboard';
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};