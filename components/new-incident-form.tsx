'use client';

import { useActionState } from 'react';
import { AlertCircle, LoaderCircle } from 'lucide-react';

import {
  createIncident,
  type CreateIncidentState,
} from '@/app/actions/incidents';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioPills } from '@/components/radio-pills';
import type { MitreTactic, Severity } from '@/lib/types';

const SEVERITIES: Severity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const TACTICS: MitreTactic[] = [
  'RECONNAISSANCE',
  'RESOURCE_DEVELOPMENT',
  'INITIAL_ACCESS',
  'EXECUTION',
  'PERSISTENCE',
  'PRIVILEGE_ESCALATION',
  'DEFENSE_EVASION',
  'CREDENTIAL_ACCESS',
  'DISCOVERY',
  'LATERAL_MOVEMENT',
  'COLLECTION',
  'COMMAND_AND_CONTROL',
  'EXFILTRATION',
  'IMPACT',
];

const initialState: CreateIncidentState = {};

export function NewIncidentForm() {
  const [state, formAction, pending] = useActionState(
    createIncident,
    initialState,
  );

  return (
    <form action={formAction} className="max-w-2xl space-y-6 p-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="Lateral movement detected — MIMIKATZ signature"
          required
          disabled={pending}
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="What was observed, and why it warrants an incident."
          rows={4}
          disabled={pending}
        />
      </div>

      <div className="space-y-2">
        <Label>Severity</Label>
        <RadioPills
          name="severity"
          options={SEVERITIES}
          required
          activeClassName="peer-checked:bg-severity-critical/15 peer-checked:text-severity-critical peer-checked:border-severity-critical/50"
        />
      </div>

      <div className="space-y-2">
        <Label>
          Tactic{' '}
          <span className="text-muted-foreground font-normal normal-case">
            (optional)
          </span>
        </Label>
        <RadioPills name="tactic" options={TACTICS} />
      </div>

      {state.error ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" aria-hidden />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
              Creating
            </>
          ) : (
            'Create incident'
          )}
        </Button>
      </div>
    </form>
  );
}
