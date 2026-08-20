import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';

import { api, ApiError } from './api';
import { getSessionToken } from './session';
import type { User } from './types';

/*
 * The single place a page asks "who is calling?".
 *
 * The cookie only proves a token was issued at some point, so the answer
 * comes from the backend rather than from decoding the token here: an
 * account disabled a minute ago must not still render an authenticated
 * shell. cache() keeps that to one request per render pass.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  if (!(await getSessionToken())) {
    return null;
  }

  try {
    return await api<User>('/auth/me');
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }

    throw error;
  }
});

/*
 * For pages that require a session. Redirects rather than returning null so
 * callers cannot forget to handle the anonymous case.
 */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return user;
}
