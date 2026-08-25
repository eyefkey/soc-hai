'use client';

import { useActionState } from 'react';
import { AlertCircle, LoaderCircle, Plus } from 'lucide-react';

import { attachAsset, type ActionResult } from '@/app/actions/assets';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { Asset } from '@/lib/types';

const initialState: ActionResult = {};

export function AttachAssetForm({
  incidentId,
  options,
}: {
  incidentId: string;
  /*
   * Assets not already linked to this incident — filtered by the caller,
   * since offering an already-attached asset here would just round-trip
   * to the backend's idempotent no-op rather than fail loudly.
   */
  options: Asset[];
}) {
  const [state, formAction, pending] = useActionState(
    attachAsset.bind(null, incidentId),
    initialState,
  );

  if (options.length === 0) {
    return (
      <p className="text-muted-foreground border-t px-4 py-3 text-xs">
        Every known asset is already linked to this incident.
      </p>
    );
  }

  return (
    <form
      action={formAction}
      className="flex items-center gap-2 border-t px-4 py-3"
    >
      <select
        name="assetId"
        required
        disabled={pending}
        defaultValue=""
        className="border-input bg-transparent h-8 flex-1 rounded-md border px-2 text-xs"
      >
        <option value="" disabled>
          Choose an asset to link…
        </option>
        {options.map((asset) => (
          <option key={asset.id} value={asset.id}>
            {asset.hostname ?? asset.name}
            {asset.ipAddress ? ` — ${asset.ipAddress}` : ''}
          </option>
        ))}
      </select>

      <Button type="submit" size="sm" disabled={pending} className="h-8 shrink-0">
        {pending ? (
          <LoaderCircle className="size-3.5 animate-spin" aria-hidden />
        ) : (
          <Plus className="size-3.5" aria-hidden />
        )}
        Link
      </Button>

      {state.error ? (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="size-3.5" aria-hidden />
          <AlertDescription className="text-xs">{state.error}</AlertDescription>
        </Alert>
      ) : null}
    </form>
  );
}
