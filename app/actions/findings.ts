'use server';

import { revalidatePath } from 'next/cache';

import { api, ApiError } from '@/lib/api';
import type { Finding } from '@/lib/types';

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

/*
 * investigationId and incidentId are both bound ahead of time
 * (createFinding.bind(null, investigationId, incidentId)) — the incident
 * id is only needed to know which page to revalidate afterward, since
 * findings live under an investigation, not an incident, in the API.
 */
export async function createFinding(
  investigationId: string,
  incidentId: string,
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const confidence = formData.get('confidence');
  const impact = String(formData.get('impact') ?? '').trim();
  const recommendation = String(formData.get('recommendation') ?? '').trim();

  if (!title) {
    return { error: 'Title is required.' };
  }

  if (!description) {
    return { error: 'Description is required.' };
  }

  try {
    await api<Finding>(`/investigations/${investigationId}/findings`, {
      method: 'POST',
      body: {
        title,
        description,
        ...(typeof confidence === 'string' && confidence
          ? { confidence }
          : {}),
        ...(impact ? { impact } : {}),
        ...(recommendation ? { recommendation } : {}),
      },
    });
  } catch (error) {
    return toActionResult(error);
  }

  revalidatePath(`/incidents/${incidentId}`);
  return {};
}

/*
 * All three ids are known ahead of time, so all three are bound —
 * deleteFinding.bind(null, investigationId, incidentId, findingId) —
 * leaving a zero-arg function for DeleteButton.
 */
export async function deleteFinding(
  investigationId: string,
  incidentId: string,
  findingId: string,
): Promise<ActionResult> {
  try {
    await api(`/investigations/${investigationId}/findings/${findingId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    return toActionResult(error);
  }

  revalidatePath(`/incidents/${incidentId}`);
  return {};
}
