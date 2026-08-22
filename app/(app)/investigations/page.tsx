import { FilterPills } from '@/components/filter-pills';
import { InvestigationTable } from '@/components/investigation-table';
import { Pagination } from '@/components/pagination';
import { api } from '@/lib/api';
import { requireUser } from '@/lib/dal';
import type { Incident, IncidentStatus, Investigation, Paginated } from '@/lib/types';

export const metadata = {
  title: 'Investigations — SOC',
};

export const dynamic = 'force-dynamic';

const STATUSES: IncidentStatus[] = [
  'OPEN',
  'INVESTIGATING',
  'CONTAINED',
  'RESOLVED',
  'CLOSED',
];

const TAKE = 25;

export default async function InvestigationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireUser();

  const params = await searchParams;
  const skip = Number(params.skip ?? 0) || 0;

  const query = new URLSearchParams({ take: String(TAKE), skip: String(skip) });
  if (params.status) query.set('status', params.status);

  const investigations = await api<
    Paginated<Investigation & { incident: Incident }>
  >(`/investigations?${query}`);

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex flex-wrap items-center gap-4 border-b px-5 py-3">
        <h1 className="text-sm font-semibold tracking-[0.1em] uppercase">
          Investigations
          <span className="text-primary ml-2">{investigations.meta.total}</span>
        </h1>

        <div className="ml-auto">
          <FilterPills
            param="status"
            active={params.status}
            options={STATUSES}
            basePath="/investigations"
            searchParams={params}
          />
        </div>
      </header>

      <InvestigationTable investigations={investigations.data} />

      <Pagination
        total={investigations.meta.total}
        skip={investigations.meta.skip}
        take={investigations.meta.take}
        basePath="/investigations"
        searchParams={params}
      />
    </div>
  );
}
