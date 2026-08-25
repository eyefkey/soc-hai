'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { api, ApiError } from '@/lib/api';
import type { Asset, AssetStatus, AssetType } from '@/lib/types';

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

export type CreateAssetState = ActionResult;

export async function createAsset(
  _previous: CreateAssetState,
  formData: FormData,
): Promise<CreateAssetState> {
  const name = String(formData.get('name') ?? '').trim();
  const type = formData.get('type');
  const status = formData.get('status');
  const hostname = String(formData.get('hostname') ?? '').trim();
  const ipAddress = String(formData.get('ipAddress') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();

  if (!name) {
    return { error: 'Name is required.' };
  }

  if (typeof type !== 'string' || !type) {
    return { error: 'Type is required.' };
  }

  try {
    await api<Asset>('/assets', {
      method: 'POST',
      body: {
        name,
        type: type as AssetType,
        ...(typeof status === 'string' && status
          ? { status: status as AssetStatus }
          : {}),
        ...(hostname ? { hostname } : {}),
        ...(ipAddress ? { ipAddress } : {}),
        ...(description ? { description } : {}),
      },
    });
  } catch (error) {
    return toActionResult(error);
  }

  revalidatePath('/assets');
  redirect('/assets');
}

/*
 * A plain async function so it can be bound with the row's id via
 * deleteAsset.bind(null, asset.id) — see app/actions/alerts.ts for why
 * this cannot be a closure factory instead.
 */
export async function deleteAsset(assetId: string): Promise<ActionResult> {
  try {
    await api(`/assets/${assetId}`, { method: 'DELETE' });
  } catch (error) {
    return toActionResult(error);
  }

  revalidatePath('/assets');
  return {};
}

/*
 * incidentId is bound ahead of time (attachAsset.bind(null, incidentId)),
 * leaving a (state, formData) shape — the exact contract useActionState
 * expects — so the form can bind context AND get pending/error state from
 * one hook, rather than choosing between the two patterns.
 */
export async function attachAsset(
  incidentId: string,
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const assetId = String(formData.get('assetId') ?? '').trim();

  if (!assetId) {
    return { error: 'Choose an asset to attach.' };
  }

  try {
    await api(`/assets/${assetId}/incidents/${incidentId}`, {
      method: 'POST',
    });
  } catch (error) {
    return toActionResult(error);
  }

  revalidatePath(`/incidents/${incidentId}`);
  return {};
}

/*
 * Both ids are known ahead of time (it's a click, not a form), so both are
 * bound: detachAsset.bind(null, incidentId, assetId) leaves a zero-arg
 * function, which is exactly what DeleteButton's action prop expects.
 */
export async function detachAsset(
  incidentId: string,
  assetId: string,
): Promise<ActionResult> {
  try {
    await api(`/assets/${assetId}/incidents/${incidentId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    return toActionResult(error);
  }

  revalidatePath(`/incidents/${incidentId}`);
  return {};
}
