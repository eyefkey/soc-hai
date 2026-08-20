import 'server-only';

import { cookies } from 'next/headers';

/*
 * The backend already issues a signed JWT, so there is no second session
 * token to mint here. The backend token is put straight into an httpOnly
 * cookie: the browser sends it automatically, and no client-side script can
 * read it, so an XSS bug cannot walk off with an analyst's credentials.
 */
export const SESSION_COOKIE = 'soc_session';

export async function getSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

export async function createSession(token: string, expiresAt: Date) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    /*
     * Secure would make the cookie undeliverable over plain http, which is
     * how the app runs locally. It is enabled everywhere else.
     */
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/*
 * Reads the expiry out of the access token so the cookie outlives it by no
 * more than a moment. Failing closed here only means a shorter cookie, and
 * the backend rejects an expired token regardless.
 */
export function tokenExpiry(token: string): Date {
  const fallback = new Date(Date.now() + 60 * 60 * 1000);

  const [, payload] = token.split('.');

  if (!payload) {
    return fallback;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8'),
    ) as { exp?: number };

    return decoded.exp ? new Date(decoded.exp * 1000) : fallback;
  } catch {
    return fallback;
  }
}
