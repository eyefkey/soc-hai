'use server';

import { redirect } from 'next/navigation';

import { api, ApiError } from '@/lib/api';
import { createSession, destroySession, tokenExpiry } from '@/lib/session';
import type { LoginResponse } from '@/lib/types';

export type LoginState = {
  error?: string;
};

export async function login(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const identifier = String(formData.get('identifier') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!identifier || !password) {
    return { error: 'Enter your username and password.' };
  }

  let result: LoginResponse;

  try {
    result = await api<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { identifier, password },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      /*
       * The backend deliberately gives the same answer for an unknown
       * account and a wrong password; repeating its wording here keeps
       * the UI from leaking which one it was.
       */
      if (error.status === 401) {
        return { error: 'Invalid credentials.' };
      }

      if (error.status === 429) {
        return {
          error: 'Too many attempts. Wait a minute before trying again.',
        };
      }

      return { error: error.message };
    }

    return { error: 'Could not reach the SOC API. Is the backend running?' };
  }

  await createSession(result.accessToken, tokenExpiry(result.accessToken));

  /*
   * redirect() throws to unwind the action, so it must sit outside the
   * try block above or it would be caught as a failure.
   */
  redirect('/dashboard');
}

export async function logout() {
  await destroySession();
  redirect('/login');
}
