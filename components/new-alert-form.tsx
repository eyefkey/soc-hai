'use client';

import { useActionState } from 'react';
import { AlertCircle, LoaderCircle } from 'lucide-react';

import { createAlert, type CreateAlertState } from '@/app/actions/alerts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

const initialState: CreateAlertState = {};

/*
 * incidentId is optional: reachable standalone from /alerts/new for a
 * detection with nowhere to attach yet, or pre-filled (and locked) when
 * opened from an incident's own page — the field is then a hidden input
 * rather than editable, since the whole point of arriving that way is
 * that the incident is already decided.
 */
export function NewAlertForm({ incidentId }: { incidentId?: string }) {
  const [state, formAction, pending] = useActionState(
    createAlert,
    initialState,
  );

  return (
    <form action={formAction} className="max-w-2xl space-y-6 p-6">
      {incidentId ? (
        <input type="hidden" name="incidentId" value={incidentId} />
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="Outbound DNS tunnel — base64 encoded subdomains"
          required
          disabled={pending}
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="source">Source</Label>
          <Input
            id="source"
            name="source"
            placeholder="EDR, SIEM, IDS…"
            disabled={pending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="affectedUser">Affected account</Label>
          <Input id="affectedUser" name="affectedUser" disabled={pending} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sourceIp">Source IP</Label>
          <Input id="sourceIp" name="sourceIp" disabled={pending} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetIp">Target IP</Label>
          <Input id="targetIp" name="targetIp" disabled={pending} />
        </div>
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
            'Create alert'
          )}
        </Button>
      </div>
    </form>
  );
}
