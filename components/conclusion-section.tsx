'use client';

import { useActionState } from 'react';
import { AlertCircle, LoaderCircle, NotebookPen } from 'lucide-react';

import { saveConclusion, type ActionResult } from '@/app/actions/incidents';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const initialState: ActionResult = {};

/*
 * Separate from Close: an analyst may want to record findings-so-far
 * without ending the case, or write the conclusion before clicking Close
 * rather than after. Saving does not change status — Close still does
 * that, in IncidentActions.
 */
export function ConclusionSection({
  investigationId,
  incidentId,
  conclusion,
  canWrite,
}: {
  investigationId: string;
  incidentId: string;
  conclusion: string | null;
  canWrite: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    saveConclusion.bind(null, investigationId, incidentId),
    initialState,
  );

  if (!canWrite) {
    return conclusion ? (
      <section className="border-b px-4 py-3">
        <h2 className="text-muted-foreground mb-2 flex items-center gap-1.5 text-[10px] tracking-[0.16em] uppercase">
          <NotebookPen className="size-3.5" aria-hidden />
          Conclusion
        </h2>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {conclusion}
        </p>
      </section>
    ) : null;
  }

  return (
    <section className="border-b px-4 py-3">
      <h2 className="text-muted-foreground mb-2 flex items-center gap-1.5 text-[10px] tracking-[0.16em] uppercase">
        <NotebookPen className="size-3.5" aria-hidden />
        Conclusion
      </h2>

      <form action={formAction} className="space-y-2">
        <Textarea
          name="conclusion"
          defaultValue={conclusion ?? ''}
          placeholder="What was found, what was done about it, and what happens next."
          rows={3}
          disabled={pending}
          className="text-sm"
        />

        <div className="flex items-center gap-2">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? (
              <LoaderCircle className="size-3.5 animate-spin" aria-hidden />
            ) : null}
            Save conclusion
          </Button>
        </div>

        {state.error ? (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="size-3.5" aria-hidden />
            <AlertDescription className="text-xs">
              {state.error}
            </AlertDescription>
          </Alert>
        ) : null}
      </form>
    </section>
  );
}
