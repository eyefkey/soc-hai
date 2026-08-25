'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { api, ApiError } from '@/lib/api';
import { requireUser } from '@/lib/dal';
import {
  nextSeverity,
  type Incident,
  type Investigation,
  type MitreTactic,
  type Severity,
} from '@/lib/types';

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

export type CreateIncidentState = ActionResult;

/*
 * useActionState's contract is (previousState, formData) => nextState, so
 * this cannot return void or throw a plain error the way a button handler
 * would — every path has to resolve to a CreateIncidentState the form can
 * render.
 */
export async function createIncident(
  _previous: CreateIncidentState,
  formData: FormData,
): Promise<CreateIncidentState> {
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const severity = formData.get('severity');
  const tactic = formData.get('tactic');

  if (!title) {
    return { error: 'Title is required.' };
  }

  if (typeof severity !== 'string' || !severity) {
    return { error: 'Severity is required.' };
  }

  let incident: Incident;

  try {
    incident = await api<Incident>('/incidents', {
      method: 'POST',
      body: {
        title,
        severity: severity as Severity,
        ...(description ? { description } : {}),
        ...(typeof tactic === 'string' && tactic
          ? { tactic: tactic as MitreTactic }
          : {}),
      },
    });
  } catch (error) {
    return toActionResult(error);
  }

  revalidatePath('/incidents');
  revalidatePath('/dashboard');

  /*
   * redirect() throws to unwind the action, so it has to sit outside the
   * try block above or it would be caught and reported as a failure.
   */
  redirect(`/incidents/${incident.id}`);
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
 * investigationId and incidentId are bound ahead of time
 * (saveConclusion.bind(null, investigationId, incidentId)), leaving a
 * (state, formData) shape for useActionState — the same pattern used for
 * attachAsset and createEvidence.
 */
export async function saveConclusion(
  investigationId: string,
  incidentId: string,
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const conclusion = String(formData.get('conclusion') ?? '').trim();

  try {
    await api(`/investigations/${investigationId}`, {
      method: 'PATCH',
      body: { conclusion },
    });
  } catch (error) {
    return toActionResult(error);
  }

  revalidatePath(`/incidents/${incidentId}`);
  return {};
}

/*
 * assignedTo is a free string on the backend, not a foreign key to a user
 * account — it accepts an external responder's name just as well as a
 * registered analyst's username. A text field matches that model more
 * honestly than a picker would, and a picker would need the ADMIN-only
 * user list besides, which would leave an ANALYST unable to reassign a
 * case at all.
 */
export async function reassignInvestigation(
  investigationId: string,
  incidentId: string,
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const assignedTo = String(formData.get('assignedTo') ?? '').trim();

  if (!assignedTo) {
    return { error: 'Enter who this investigation is assigned to.' };
  }

  try {
    await api(`/investigations/${investigationId}`, {
      method: 'PATCH',
      body: { assignedTo },
    });
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
