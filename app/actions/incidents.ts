'use server';

import { revalidatePath } from 'next/cache';

import { api, ApiError } from '@/lib/api';
import { requireUser } from '@/lib/dal';
import { nextSeverity, type Incident, type Investigation } from '@/lib/types';

export type ActionResult = { error?: string };

/*
 * Every action re-fetches the incident it needs rather than trusting a
 * value passed from the client, since the client's copy may be stale by
 * the time the button is pressed.
 */
async function currentIncident(incidentId: string): Promise<Incident> {
  return api<Incident>(`/incidents/${incidentId}`);
}

function toActionResult(error: unknown): ActionResult {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return { error: 'Your role does not allow this action.' };
    }

    return { error: error.message };
  }

  return { error: 'Could not reach the SOC API.' };
}

export async function escalateIncident(
  incidentId: string,
): Promise<ActionResult> {
  try {
    const incident = await currentIncident(incidentId);
    const escalated = nextSeverity(incident.severity);

    if (!escalated) {
      return { error: 'Already at the highest severity.' };
    }

    await api(`/incidents/${incidentId}`, {
      method: 'PATCH',
      body: { severity: escalated },
    });
  } catch (error) {
    return toActionResult(error);
  }

  revalidatePath(`/incidents/${incidentId}`);
  revalidatePath('/dashboard');
  return {};
}

/*
 * Opens an investigation if the incident does not have one yet — creation
 * is idempotent on the backend, returning the existing one — then assigns
 * it to the caller and moves it off OPEN.
 */
export async function assignToMe(incidentId: string): Promise<ActionResult> {
  const user = await requireUser();

  try {
    const investigation = await api<Investigation>('/investigations', {
      method: 'POST',
      body: { incidentId },
    });

    await api(`/investigations/${investigation.id}`, {
      method: 'PATCH',
      body: {
        assignedTo: user.username,
        ...(investigation.status === 'OPEN'
          ? { status: 'INVESTIGATING' }
          : {}),
      },
    });

    const incident = await currentIncident(incidentId);

    if (incident.status === 'OPEN') {
      await api(`/incidents/${incidentId}`, {
        method: 'PATCH',
        body: { status: 'INVESTIGATING' },
      });
    }
  } catch (error) {
    return toActionResult(error);
  }

  revalidatePath(`/incidents/${incidentId}`);
  revalidatePath('/dashboard');
  return {};
}

/*
 * Closes the incident and, if an investigation is attached, resolves it
 * too — an incident and an orphaned open investigation would disagree
 * about whether the case is still active.
 */
export async function closeIncident(
  incidentId: string,
): Promise<ActionResult> {
  try {
    const incident = await currentIncident(incidentId);

    await api(`/incidents/${incidentId}`, {
      method: 'PATCH',
      body: { status: 'CLOSED' },
    });

    if (
      incident.investigation &&
      !['RESOLVED', 'CLOSED'].includes(incident.investigation.status)
    ) {
      await api(`/investigations/${incident.investigation.id}`, {
        method: 'PATCH',
        body: { status: 'CLOSED' },
      });
    }
  } catch (error) {
    return toActionResult(error);
  }

  revalidatePath(`/incidents/${incidentId}`);
  revalidatePath('/dashboard');
  return {};
}
