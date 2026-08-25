'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { api, ApiError } from '@/lib/api';
import type { User, UserRole } from '@/lib/types';

export type ActionResult = { error?: string };

function toActionResult(error: unknown): ActionResult {
  if (error instanceof ApiError) {
    /*
     * Surfaced verbatim: the backend's own messages here are specific and
     * user-facing already — "You cannot deactivate your own account",
     * "You cannot remove your own ADMIN role" — not something to reword.
     */
    return { error: error.message };
  }

  return { error: 'Could not reach the SOC API.' };
}

export type RegisterUserState = ActionResult;

export async function registerUser(
  _previous: RegisterUserState,
  formData: FormData,
): Promise<RegisterUserState> {
  const email = String(formData.get('email') ?? '').trim();
  const username = String(formData.get('username') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const role = formData.get('role');

  if (!email) {
    return { error: 'Email is required.' };
  }

  if (!username) {
    return { error: 'Username is required.' };
  }

  if (password.length < 12) {
    return { error: 'Password must be at least 12 characters.' };
  }

  try {
    await api<User>('/auth/register', {
      method: 'POST',
      body: {
        email,
        username,
        password,
        ...(typeof role === 'string' && role ? { role: role as UserRole } : {}),
      },
    });
  } catch (error) {
    return toActionResult(error);
  }

  revalidatePath('/users');
  redirect('/users');
}

export async function updateUserRole(
  userId: string,
  role: UserRole,
): Promise<ActionResult> {
  try {
    await api(`/auth/users/${userId}`, {
      method: 'PATCH',
      body: { role },
    });
  } catch (error) {
    return toActionResult(error);
  }

  revalidatePath('/users');
  return {};
}

export async function setUserActive(
  userId: string,
  isActive: boolean,
): Promise<ActionResult> {
  try {
    await api(`/auth/users/${userId}`, {
      method: 'PATCH',
      body: { isActive },
    });
  } catch (error) {
    return toActionResult(error);
  }

  revalidatePath('/users');
  return {};
}
