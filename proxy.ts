import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { SESSION_COOKIE } from '@/lib/session';

/*
 * Renamed from Middleware in Next.js 16; the behaviour is unchanged.
 *
 * This is an optimistic check only. It keeps anonymous traffic from
 * rendering the console shell, but it never treats the presence of a
 * cookie as proof of anything — the value is not verified here. Every page
 * still asks the backend who the caller is (see lib/dal.ts), which is what
 * catches an expired token or an account disabled seconds ago.
 */
export function proxy(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const { pathname } = request.nextUrl;

  if (!hasSession && pathname !== '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Everything except Next internals, the auth server actions and static
   * assets.
   */
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\.svg).*)'],
};
