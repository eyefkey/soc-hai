'use client';

import { useActionState, useState } from 'react';
import { AlertCircle, LoaderCircle, Pencil } from 'lucide-react';

import { reassignInvestigation, type ActionResult } from '@/app/actions/incidents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const initialState: ActionResult = {};

/*
 * Click-to-edit rather than an always-open form, so the metadata row this
 * lives in reads the same as its Host/User/Tactic neighbours until an
 * analyst actually wants to change who owns the case.
 */
export function AssignmentEditor({
  investigationId,
  incidentId,
  assignedTo,
  canWrite,
}: {
  investigationId: string;
  incidentId: string;
  assignedTo: string | null;
  canWrite: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(
    reassignInvestigation.bind(null, investigationId, incidentId),
    initialState,
  );
  /*
   * A successful save revalidates the page, which flows the new value back
   * down as this same assignedTo prop — so a changed prop is the signal
   * the save actually landed, closing the editor. This is React's
   * documented "adjust state when a prop changes" pattern: comparing and
   * calling setState directly in the render body, not in an effect, which
   * is what avoids the extra render pass a useEffect version needs. A
   * failed save leaves assignedTo untouched, so the editor stays open with
   * the error still showing.
   */
  const [lastSeen, setLastSeen] = useState(assignedTo);
  if (assignedTo !== lastSeen) {
    setLastSeen(assignedTo);
    setEditing(false);
  }

  if (!canWrite) {
    return <span>{assignedTo ?? 'Unassigned'}</span>;
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="hover:text-primary inline-flex items-center gap-1 transition-colors"
      >
        {assignedTo ?? 'Unassigned'}
        <Pencil className="size-3" aria-hidden />
      </button>
    );
  }

  return (
    <form action={formAction} className="inline-flex items-center gap-1.5">
      <Input
        name="assignedTo"
        defaultValue={assignedTo ?? ''}
        disabled={pending}
        autoFocus
        className="h-6 w-36 px-1.5 text-[11px] normal-case"
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
