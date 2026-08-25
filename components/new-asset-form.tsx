'use client';

import { useActionState } from 'react';
import { AlertCircle, LoaderCircle } from 'lucide-react';

import { createAsset, type CreateAssetState } from '@/app/actions/assets';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioPills } from '@/components/radio-pills';
import type { AssetStatus, AssetType, Severity } from '@/lib/types';

const TYPES: AssetType[] = [
  'SERVER',
  'DATABASE',
  'API',
  'ENDPOINT',
  'NETWORK_DEVICE',
  'CLOUD',
  'OTHER',
];

const STATUSES: AssetStatus[] = [
  'ACTIVE',
  'INACTIVE',
  'COMPROMISED',
  'QUARANTINED',
  'DECOMMISSIONED',
];

const SEVERITIES: Severity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const initialState: CreateAssetState = {};

export function NewAssetForm() {
  const [state, formAction, pending] = useActionState(
    createAsset,
    initialState,
  );

  return (
    <form action={formAction} className="max-w-2xl space-y-6 p-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="WS-FINANCE-04"
            required
            disabled={pending}
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hostname">Hostname</Label>
          <Input id="hostname" name="hostname" disabled={pending} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ipAddress">IP address</Label>
          <Input id="ipAddress" name="ipAddress" disabled={pending} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" name="description" disabled={pending} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="monitoredUrl">
          Monitored URL{' '}
          <span className="text-muted-foreground font-normal normal-case">
            (optional — the uptime checker polls this and opens an incident
            here on outage)
          </span>
        </Label>
        <Input
          id="monitoredUrl"
          name="monitoredUrl"
          type="url"
          placeholder="https://example.com"
          disabled={pending}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="checkThreshold">
            Failures before incident{' '}
            <span className="text-muted-foreground font-normal normal-case">
              (optional — defaults to the checker&apos;s own setting)
            </span>
          </Label>
          <Input
            id="checkThreshold"
            name="checkThreshold"
            type="number"
            min={1}
            placeholder="3"
            disabled={pending}
          />
        </div>

        <div className="space-y-2">
          <Label>
            Incident severity{' '}
            <span className="text-muted-foreground font-normal normal-case">
              (optional — defaults to HIGH)
            </span>
          </Label>
          <RadioPills name="checkSeverity" options={SEVERITIES} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Type</Label>
        <RadioPills name="type" options={TYPES} required />
      </div>

      <div className="space-y-2">
        <Label>
          Status{' '}
          <span className="text-muted-foreground font-normal normal-case">
            (defaults to ACTIVE)
          </span>
        </Label>
        <RadioPills name="status" options={STATUSES} />
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
            'Create asset'
          )}
        </Button>
      </div>
    </form>
  );
}
