'use server';

import { revalidatePath } from 'next/cache';

import { api, ApiError } from '@/lib/api';
import type { Evidence, EvidenceType } from '@/lib/types';

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
 * incidentId is bound ahead of time (createEvidence.bind(null, incidentId))
 * from within the incident detail page, leaving a (state, formData) shape
 * for useActionState — the same pattern as attachAsset.
 */
export async function createEvidence(
  incidentId: string,
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const type = formData.get('type');
  const value = String(formData.get('value') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();

  if (typeof type !== 'string' || !type) {
    return { error: 'Type is required.' };
  }

  if (!value) {
    return { error: 'Value is required.' };
  }

  try {
    await api<Evidence>('/evidence', {
      method: 'POST',
      body: {
        type: type as EvidenceType,
        value,
        incidentId,
        ...(description ? { description } : {}),
      },
    });
  } catch (error) {
    return toActionResult(error);
  }

  revalidatePath(`/incidents/${incidentId}`);
  return {};
}

/*
 * Both ids are known ahead of time, so both are bound —
 * deleteEvidence.bind(null, incidentId, evidenceId) — leaving a zero-arg
 * function for DeleteButton.
 */
export async function deleteEvidence(
  incidentId: string,
  evidenceId: string,
): Promise<ActionResult> {
  try {
    await api(`/evidence/${evidenceId}`, { method: 'DELETE' });
  } catch (error) {
    return toActionResult(error);
  }

  revalidatePath(`/incidents/${incidentId}`);
  return {};
}
