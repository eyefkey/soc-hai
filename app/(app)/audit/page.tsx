import { AuditTable } from '@/components/audit-table';
import { FilterPills } from '@/components/filter-pills';
import { Pagination } from '@/components/pagination';
import { api } from '@/lib/api';
import { requireUser } from '@/lib/dal';
import type { AuditEntity, AuditLogEntry, Paginated } from '@/lib/types';

export const metadata = {
  title: 'Audit log — SOC',
};

export const dynamic = 'force-dynamic';

const ENTITIES: AuditEntity[] = [
  'INCIDENT',
  'ALERT',
  'ASSET',
  'EVIDENCE',
  'INVESTIGATION',
  'FINDING',
  'USER',
];

const TAKE = 50;

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireUser();

  const params = await searchParams;
  const skip = Number(params.skip ?? 0) || 0;

  const query = new URLSearchParams({ take: String(TAKE), skip: String(skip) });
  if (params.entity) query.set('entity', params.entity);

  const audit = await api<Paginated<AuditLogEntry>>(`/audit?${query}`);

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex flex-wrap items-center gap-4 border-b px-5 py-3">
        <h1 className="text-sm font-semibold tracking-[0.1em] uppercase">
          Audit log
          <span className="text-primary ml-2">{audit.meta.total}</span>
        </h1>

        <div className="ml-auto">
          <FilterPills
            param="entity"
            active={params.entity}
            options={ENTITIES}
            basePath="/audit"
            searchParams={params}
          />
        </div>
      </header>

      <AuditTable entries={audit.data} />

      <Pagination
        total={audit.meta.total}
        skip={audit.meta.skip}
        take={audit.meta.take}
        basePath="/audit"
        searchParams={params}
      />
    </div>
  );
}
