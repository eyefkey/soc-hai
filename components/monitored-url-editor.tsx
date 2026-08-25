'use client';

import { useActionState, useState } from 'react';
import { AlertCircle, LoaderCircle, Pencil, Radar } from 'lucide-react';

import { updateMonitoredUrl, type ActionResult } from '@/app/actions/assets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const initialState: ActionResult = {};

/*
 * Same click-to-edit shape as AssignmentEditor: reads like a plain value
 * in the table until an analyst wants to change it, and the revalidated
 * monitoredUrl prop flowing back down is what closes the editor on a
 * successful save (see AssignmentEditor for why that's done in render,
 * not an effect).
 */
export function MonitoredUrlEditor({
  assetId,
  monitoredUrl,
  canWrite,
}: {
  assetId: string;
  monitoredUrl: string | null | undefined;
  canWrite: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(
    updateMonitoredUrl.bind(null, assetId),
    initialState,
  );

  const [lastSeen, setLastSeen] = useState(monitoredUrl);
  if (monitoredUrl !== lastSeen) {
    setLastSeen(monitoredUrl);
    setEditing(false);
  }

  if (!canWrite) {
    return monitoredUrl ? (
      <span className="inline-flex items-center gap-1">
        <Radar className="size-3" aria-hidden />
        {monitoredUrl}
      </span>
    ) : (
      <span className="text-muted-foreground">Not monitored</span>
    );
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="hover:text-primary inline-flex items-center gap-1 transition-colors"
      >
        {monitoredUrl ? (
          <>
            <Radar className="size-3" aria-hidden />
            {monitoredUrl}
          </>
        ) : (
          <span className="text-muted-foreground">Not monitored</span>
        )}
        <Pencil className="size-3" aria-hidden />
      </button>
    );
  }

  return (
    <form action={formAction} className="inline-flex items-center gap-1.5">
      <Input
        name="monitoredUrl"
        type="url"
        defaultValue={monitoredUrl ?? ''}
        placeholder="https://example.com"
        disabled={pending}
        autoFocus
        className="h-6 w-56 px-1.5 text-[11px] normal-case"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setEditing(false);
          }
        }}
      />
      <Button type="submit" size="sm" disabled={pending} className="h-6 px-2 text-[10px]">
        {pending ? <LoaderCircle className="size-3 animate-spin" aria-hidden /> : 'Save'}
      </Button>
      {state.error ? (
        <span className="text-severity-critical inline-flex items-center gap-1 text-[10px]">
          <AlertCircle className="size-3" aria-hidden />
          {state.error}
        </span>
      ) : null}
    </form>
  );
}
