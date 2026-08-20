import { Radio } from 'lucide-react';

import { ActivityChart } from '@/components/activity-chart';
import { IncidentQueue } from '@/components/incident-queue';
import { KpiStrip } from '@/components/kpi-strip';
import { TacticChart } from '@/components/tactic-chart';
import { SeverityFilter } from '@/components/severity-filter';
import { api } from '@/lib/api';
import { requireUser } from '@/lib/dal';
import type {
  Incident,
  Paginated,
  Severity,
  StatsOverview,
} from '@/lib/types';

export const metadata = {
  title: 'Console — SOC',
};

/*
 * Live data on every load. The backend has no push channel, so the console
 * refreshes on navigation and on the queue's own interval rather than
 * pretending to stream.
 */
export const dynamic = 'force-dynamic';

const SEVERITIES: Severity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export default async function ConsolePage({
  searchParams,
}: {
  searchParams: Promise<{ severity?: string }>;
}) {
  await requireUser();

  const { severity } = await searchParams;
  const active = SEVERITIES.includes(severity as Severity)
    ? (severity as Severity)
    : undefined;

  const [stats, incidents] = await Promise.all([
    api<StatsOverview>('/stats/overview?windowMinutes=60&buckets=12'),
    api<Paginated<Incident>>(
      `/incidents?take=25${active ? `&severity=${active}` : ''}`,
    ),
  ]);

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex flex-wrap items-center gap-4 border-b px-5 py-2.5">
        <span className="text-primary flex items-center gap-2 text-[11px] tracking-[0.16em] uppercase">
          <Radio className="size-3.5 animate-pulse" aria-hidden />
          Live
        </span>

        <span className="text-muted-foreground text-[11px] tabular-nums">
          {new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC
        </span>

        <div className="ml-auto">
          <SeverityFilter active={active} />
        </div>
      </header>

      <KpiStrip stats={stats} />

      <div className="grid flex-1 gap-px lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <section className="flex min-w-0 flex-col border-r">
          <div className="flex items-center justify-between border-b px-4 py-2">
            <h2 className="text-[11px] tracking-[0.16em] uppercase">
              Incident queue
              <span className="text-primary ml-2">{incidents.meta.total}</span>
            </h2>
            <span className="text-muted-foreground text-[10px] tracking-wider uppercase">
              Sort: newest
            </span>
          </div>

          <IncidentQueue incidents={incidents.data} />
        </section>

        <aside className="flex min-w-0 flex-col">
          <div className="border-b px-4 py-3">
            <ActivityChart
              series={stats.activity.series}
              windowMinutes={stats.activity.windowMinutes}
            />
          </div>

          <div className="flex flex-1 flex-col border-b">
            <h2 className="text-muted-foreground border-b px-4 py-2 text-[10px] tracking-[0.16em] uppercase">
              MITRE tactic distribution / 24h
            </h2>
            <TacticChart tactics={stats.tactics} />
          </div>
        </aside>
      </div>
    </div>
  );
}
