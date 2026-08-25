'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { api, ApiError } from '@/lib/api';
import type { Alert, MitreTactic, Severity } from '@/lib/types';

export type ActionResult = { error?: string };

function toActionResult(error: unknown): ActionResult {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return { error: 'Your role does not allow this action.' };
    }

    return { error: error.message };
  }

  return { error: 'Could not reach the SOC API.' };
}

export type CreateAlertState = ActionResult;

export async function createAlert(
  _previous: CreateAlertState,
  formData: FormData,
): Promise<CreateAlertState> {
  const title = String(formData.get('title') ?? '').trim();
  const severity = formData.get('severity');
  const source = String(formData.get('source') ?? '').trim();
  const sourceIp = String(formData.get('sourceIp') ?? '').trim();
  const targetIp = String(formData.get('targetIp') ?? '').trim();
  const affectedUser = String(formData.get('affectedUser') ?? '').trim();
  const tactic = formData.get('tactic');
  const incidentId = String(formData.get('incidentId') ?? '').trim();

  if (!title) {
    return { error: 'Title is required.' };
  }

  if (typeof severity !== 'string' || !severity) {
    return { error: 'Severity is required.' };
  }

  try {
    await api<Alert>('/alerts', {
      method: 'POST',
      body: {
        title,
        severity: severity as Severity,
        ...(source ? { source } : {}),
        ...(sourceIp ? { sourceIp } : {}),
        ...(targetIp ? { targetIp } : {}),
        ...(affectedUser ? { affectedUser } : {}),
        ...(typeof tactic === 'string' && tactic
          ? { tactic: tactic as MitreTactic }
          : {}),
        ...(incidentId ? { incidentId } : {}),
      },
    });
  } catch (error) {
    return toActionResult(error);
  }

  revalidatePath('/alerts');

  if (incidentId) {
    revalidatePath(`/incidents/${incidentId}`);
    revalidatePath('/dashboard');
    /*
     * redirect() throws to unwind the action, so it has to sit outside the
     * try block above or it would be caught and reported as a failure.
     */
    redirect(`/incidents/${incidentId}`);
  }

  redirect(`/alerts`);
}

/*
 * A plain async function, not a closure factory: Next's compiler only
 * attaches the reference metadata a server action needs to cross the
 * client/server boundary to functions it recognises as actions, which a
 * hand-rolled closure returned from a wrapper would not carry. The row's
 * id is supplied later via deleteAlert.bind(null, alert.id), the pattern
 * the framework documents for this exact case.
 */
export async function deleteAlert(alertId: string): Promise<ActionResult> {
  try {
    await api(`/alerts/${alertId}`, { method: 'DELETE' });
  } catch (error) {
    return toActionResult(error);
  }

  revalidatePath('/alerts');
  return {};
}
