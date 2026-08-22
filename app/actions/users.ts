'use server';

import { revalidatePath } from 'next/cache';

import { api, ApiError } from '@/lib/api';
import type { UserRole } from '@/lib/types';

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
