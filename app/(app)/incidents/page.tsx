import { IncidentQueue } from '@/components/incident-queue';
import { FilterPills } from '@/components/filter-pills';
import { Pagination } from '@/components/pagination';
import { api } from '@/lib/api';
import { requireUser } from '@/lib/dal';
import type { Incident, IncidentStatus, Paginated, Severity } from '@/lib/types';

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
  await requireUser();

  const params = await searchParams;
  const skip = Number(params.skip ?? 0) || 0;

  const query = new URLSearchParams({ take: String(TAKE), skip: String(skip) });
  if (params.severity) query.set('severity', params.severity);
  if (params.status) query.set('status', params.status);

  const incidents = await api<Paginated<Incident>>(`/incidents?${query}`);

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex flex-wrap items-center gap-4 border-b px-5 py-3">
        <h1 className="text-sm font-semibold tracking-[0.1em] uppercase">
          Incidents
          <span className="text-primary ml-2">{incidents.meta.total}</span>
        </h1>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-4">
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
