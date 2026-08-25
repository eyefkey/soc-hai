import Link from 'next/link';
import { Plus } from 'lucide-react';

import { IncidentQueue } from '@/components/incident-queue';
import { FilterPills } from '@/components/filter-pills';
import { Pagination } from '@/components/pagination';
import { TacticSelect } from '@/components/tactic-select';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { requireUser } from '@/lib/dal';
import {
  hasRole,
  type Incident,
  type IncidentStatus,
  type Paginated,
  type Severity,
} from '@/lib/types';

export const metadata = {
  title: 'Incidents — SOC',
};

export const dynamic = 'force-dynamic';

const SEVERITIES: Severity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const STATUSES: IncidentStatus[] = [
  'OPEN',
  'INVESTIGATING',
  'CONTAINED',
  'RESOLVED',
  'CLOSED',
];

const TAKE = 25;

export default async function IncidentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireUser();

  const params = await searchParams;
  const skip = Number(params.skip ?? 0) || 0;

  const query = new URLSearchParams({ take: String(TAKE), skip: String(skip) });
  if (params.severity) query.set('severity', params.severity);
  if (params.status) query.set('status', params.status);
  if (params.tactic) query.set('tactic', params.tactic);

  const incidents = await api<Paginated<Incident>>(`/incidents?${query}`);

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex flex-wrap items-center gap-4 border-b px-5 py-3">
        <h1 className="text-sm font-semibold tracking-[0.1em] uppercase">
          Incidents
          <span className="text-primary ml-2">{incidents.meta.total}</span>
        </h1>

        {hasRole(user, 'ANALYST') ? (
          <Button asChild size="sm" className="ml-auto">
            <Link href="/incidents/new">
              <Plus className="size-3.5" aria-hidden />
              New incident
            </Link>
          </Button>
        ) : null}

        <div className="flex w-full flex-wrap items-center justify-end gap-4">
          <FilterPills
            param="status"
            active={params.status}
            options={STATUSES}
            basePath="/incidents"
            searchParams={params}
          />
          <FilterPills
            param="severity"
            active={params.severity}
            options={SEVERITIES}
            basePath="/incidents"
            searchParams={params}
            activeClassName="bg-severity-critical/15 text-severity-critical border-severity-critical/50"
          />
          <TacticSelect
            active={params.tactic}
            basePath="/incidents"
            searchParams={params}
          />
        </div>
      </header>

      <IncidentQueue incidents={incidents.data} />

      <Pagination
        total={incidents.meta.total}
        skip={incidents.meta.skip}
        take={incidents.meta.take}
        basePath="/incidents"
        searchParams={params}
      />
    </div>
  );
}
