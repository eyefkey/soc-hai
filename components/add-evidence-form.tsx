'use client';

import { useActionState } from 'react';
import { AlertCircle, LoaderCircle, Plus } from 'lucide-react';

import { createEvidence, type ActionResult } from '@/app/actions/evidence';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioPills } from '@/components/radio-pills';
import type { EvidenceType } from '@/lib/types';

const TYPES: EvidenceType[] = [
  'IP_ADDRESS',
  'DOMAIN',
  'URL',
  'FILE_HASH',
  'LOG',
  'SCREENSHOT',
  'FILE',
  'OTHER',
];

const initialState: ActionResult = {};

export function AddEvidenceForm({ incidentId }: { incidentId: string }) {
  const [state, formAction, pending] = useActionState(
    createEvidence.bind(null, incidentId),
    initialState,
  );

  return (
    <form action={formAction} className="space-y-3 border-t px-4 py-3">
      <RadioPills name="type" options={TYPES} required />

      <div className="flex gap-2">
        <Input
          name="value"
          placeholder="Value — IP, domain, hash…"
          required
          disabled={pending}
          className="h-8 flex-1 text-xs"
        />
        <Input
          name="description"
          placeholder="Description (optional)"
          disabled={pending}
          className="h-8 flex-1 text-xs"
        />
        <Button type="submit" size="sm" disabled={pending} className="h-8 shrink-0">
          {pending ? (
            <LoaderCircle className="size-3.5 animate-spin" aria-hidden />
          ) : (
            <Plus className="size-3.5" aria-hidden />
          )}
          Add
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
