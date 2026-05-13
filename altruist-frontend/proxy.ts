import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Route Guard (proxy.ts)
 *
 * Reads `token` and `userType` cookies written by AuthContext after Firebase sign-in.
 * Redirects unauthenticated or unauthorised users before any page renders.
 *
 * Cookie semantics (set in context/AuthContext.tsx):
 *   token    — Firebase JWT (presence = authenticated)
 *   userType — PATIENT | DOCTOR | SUPER_ADMIN
 */

// ── Route rule sets ──────────────────────────────────────────────────────────

/** Protected routes that require ANY authenticated user (role doesn't matter). */
const AUTH_REQUIRED_PREFIXES = [
  '/support',
  '/settings',
  '/cart',
  '/checkout',
  '/consultation',
  '/download',
];

/**
 * Routes guarded by a specific role.
 * Matched in order — first matching prefix wins.
 */
const ROLE_RULES: { prefix: string; role: string }[] = [
  // Admin panel — SUPER_ADMIN only
  { prefix: '/admin',           role: 'SUPER_ADMIN' },

  // Doctor dashboard & management — DOCTOR only
  { prefix: '/doctor',          role: 'DOCTOR' },   // /(dashboard)/doctor/*
  { prefix: '/doctors/vlogs',   role: 'DOCTOR' },   // doctor vlog management

  // Patient dashboard — PATIENT only
  { prefix: '/patient',         role: 'PATIENT' },  // /(dashboard)/patient/*
];

/** Auth pages that should redirect to the user's dashboard when already logged in. */
const AUTH_PAGE_PATHS = ['/login', '/register'];

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Maps a userType to the correct post-login landing page. */
function dashboardForRole(userType: string | undefined): string {
  switch (userType) {
    case 'SUPER_ADMIN': return '/admin';
    case 'DOCTOR':      return '/doctor';
    default:            return '/patient'; // PATIENT or unknown
  }
}

// ── Main handler ─────────────────────────────────────────────────────────────

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token    = request.cookies.get('token')?.value;
  const userType = request.cookies.get('userType')?.value;

  // ── 1. Auth pages — redirect already-logged-in users to their dashboard ──
  if (AUTH_PAGE_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    if (token) {
      return NextResponse.redirect(new URL(dashboardForRole(userType), request.url));
    }
    return NextResponse.next();
  }

  // ── 2. Generic auth-required routes ─────────────────────────────────────
  if (AUTH_REQUIRED_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // ── 3. Role-guarded routes ───────────────────────────────────────────────
  const matchedRule = ROLE_RULES.find(({ prefix }) => pathname.startsWith(prefix));

  if (matchedRule) {
    // 3a. Not logged in → /login
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    // 3b. Wrong role → /unauthorized
    if (userType !== matchedRule.role) {
      const url = new URL('/unauthorized', request.url);
      url.searchParams.set('required', matchedRule.role);
      url.searchParams.set('current', userType ?? '');
      return NextResponse.redirect(url);
    }
  }

  // ── 4. Everything else — pass through ────────────────────────────────────
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all navigable routes, skipping:
     * - _next/static, _next/image  (Next internals / asset serving)
     * - favicon.ico
     * - Static asset extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|otf)$).*)',
  ],
};