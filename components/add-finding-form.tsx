'use client';

import { useActionState } from 'react';
import { AlertCircle, LoaderCircle, Plus } from 'lucide-react';

import { createFinding, type ActionResult } from '@/app/actions/findings';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioPills } from '@/components/radio-pills';

const CONFIDENCE = ['LOW', 'MEDIUM', 'HIGH'] as const;

const initialState: ActionResult = {};

export function AddFindingForm({
  investigationId,
  incidentId,
}: {
  investigationId: string;
  incidentId: string;
}) {
  const [state, formAction, pending] = useActionState(
    createFinding.bind(null, investigationId, incidentId),
    initialState,
  );

  return (
    <form action={formAction} className="space-y-3 border-t px-4 py-3">
      <Input
        name="title"
        placeholder="Finding title"
        required
        disabled={pending}
        className="h-8 text-xs"
      />

      <Textarea
        name="description"
        placeholder="What was found, and how it was determined."
        required
        disabled={pending}
        rows={2}
        className="text-xs"
      />

      <div className="grid grid-cols-2 gap-2">
        <Input
          name="impact"
          placeholder="Impact (optional)"
          disabled={pending}
          className="h-8 text-xs"
        />
        <Input
          name="recommendation"
          placeholder="Recommendation (optional)"
          disabled={pending}
          className="h-8 text-xs"
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <RadioPills
          name="confidence"
          options={CONFIDENCE}
          defaultValue="MEDIUM"
        />

        <Button type="submit" size="sm" disabled={pending} className="shrink-0">
          {pending ? (
            <LoaderCircle className="size-3.5 animate-spin" aria-hidden />
          ) : (
            <Plus className="size-3.5" aria-hidden />
          )}
          Add finding
        </Button>
      </div>

      {state.error ? (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="size-3.5" aria-hidden />
          <AlertDescription className="text-xs">{state.error}</AlertDescription>
        </Alert>
      ) : null}
    </form>
  );
}
