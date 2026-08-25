import Link from 'next/link';
import { Plus } from 'lucide-react';

import { AlertTable } from '@/components/alert-table';
import { FilterPills } from '@/components/filter-pills';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { requireUser } from '@/lib/dal';
import {
  hasRole,
  type Alert,
  type Incident,
  type Paginated,
  type Severity,
} from '@/lib/types';

export const metadata = {
  title: 'Alerts — SOC',
};

export const dynamic = 'force-dynamic';

const SEVERITIES: Severity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const TAKE = 25;

export default async function AlertsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireUser();

  const params = await searchParams;
  const skip = Number(params.skip ?? 0) || 0;

  const query = new URLSearchParams({ take: String(TAKE), skip: String(skip) });
  if (params.severity) query.set('severity', params.severity);

  const alerts = await api<Paginated<Alert & { incident: Incident | null }>>(
    `/alerts?${query}`,
  );

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex flex-wrap items-center gap-4 border-b px-5 py-3">
        <h1 className="text-sm font-semibold tracking-[0.1em] uppercase">
          Alerts
          <span className="text-primary ml-2">{alerts.meta.total}</span>
        </h1>

        {hasRole(user, 'ANALYST') ? (
          <Button asChild size="sm" className="ml-auto">
            <Link href="/alerts/new">
              <Plus className="size-3.5" aria-hidden />
              New alert
            </Link>
          </Button>
        ) : null}

        <div className="flex w-full flex-wrap items-center justify-end gap-4">
          <FilterPills
            param="severity"
            active={params.severity}
            options={SEVERITIES}
            basePath="/alerts"
            searchParams={params}
            activeClassName="bg-severity-critical/15 text-severity-critical border-severity-critical/50"
          />
        </div>
      </header>

      <AlertTable alerts={alerts.data} canDelete={hasRole(user, 'ADMIN')} />

      <Pagination
        total={alerts.meta.total}
        skip={alerts.meta.skip}
        take={alerts.meta.take}
        basePath="/alerts"
        searchParams={params}
      />
    </div>
  );
}
