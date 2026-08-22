import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { ActivityChart } from '@/components/activity-chart';
import { AutomatedAnalysis } from '@/components/automated-analysis';
import { EventTimeline } from '@/components/event-timeline';
import { IncidentActions } from '@/components/incident-actions';
import { SeverityBadge, StatusBadge } from '@/components/severity-badge';
import { api, ApiError } from '@/lib/api';
import { requireUser } from '@/lib/dal';
import {
  incidentRef,
  tacticLabel,
  type ActivityBucket,
  type CorrelationResult,
  type Explanation,
  type IncidentDetail,
  type InvestigationEvent,
  type Severity,
} from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const incident = await loadIncident(id);

  return {
    title: incident
      ? `${incidentRef(incident.number)} — ${incident.title}`
      : 'Incident not found',
  };
}

async function loadIncident(id: string): Promise<IncidentDetail | null> {
  try {
    return await api<IncidentDetail>(`/incidents/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

/*
 * The dashboard's activity chart reads a purpose-built stats endpoint. A
 * single incident has no such endpoint, so its chart is built from the
 * alerts already loaded with the incident — a handful of rows, cheap to
 * bucket on the server.
 */
function bucketIncidentAlerts(
  alerts: IncidentDetail['alerts'],
  bucketCount = 12,
): { series: ActivityBucket[]; windowMinutes: number } {
  if (alerts.length === 0) {
    const now = Date.now();
    return {
      windowMinutes: 60,
      series: Array.from({ length: bucketCount }, (_, index) => ({
        at: new Date(now - (bucketCount - index) * 5 * 60_000).toISOString(),
        CRITICAL: 0,
        HIGH: 0,
        MEDIUM: 0,
        LOW: 0,
      })),
    };
  }

  const times = alerts.map((alert) => new Date(alert.createdAt).getTime());
  const earliest = Math.min(...times);
  const latest = Math.max(...times);

  /*
   * A span under a minute would divide into meaningless sub-second
   * buckets, so the window is floored to a minute of padding either side.
   */
  const span = Math.max(latest - earliest, 60_000);
  const start = earliest - span * 0.1;
  const windowMinutes = Math.max(1, Math.round((span * 1.2) / 60_000));
  const sliceMs = (span * 1.2) / bucketCount;

  const series: ActivityBucket[] = Array.from({ length: bucketCount }, (_, index) => ({
    at: new Date(start + index * sliceMs).toISOString(),
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  }));

  for (const alert of alerts) {
    const offset = new Date(alert.createdAt).getTime() - start;
    const index = Math.min(bucketCount - 1, Math.max(0, Math.floor(offset / sliceMs)));
    series[index][alert.severity as Severity] += 1;
  }

  return { series, windowMinutes };
}

export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const incident = await loadIncident(id);

  if (!incident) {
    notFound();
  }

  const investigationId = incident.investigation?.id;

  const [events, correlation, explanation] = investigationId
    ? await Promise.all([
        api<InvestigationEvent[]>(`/investigations/${investigationId}/events`),
        api<CorrelationResult>(`/investigations/${investigationId}/correlations`),
        api<Explanation>(`/investigations/${investigationId}/explanation`),
      ])
    : [null, null, null];

  const host = incident.assets?.[0]?.asset;
  const primaryAlert = incident.alerts[0];
  const activity = bucketIncidentAlerts(incident.alerts);

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex flex-wrap items-center gap-3 border-b px-5 py-2.5">
        <Link
          href="/dashboard"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-[11px] tracking-[0.14em] uppercase transition-colors"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Queue
        </Link>

        <span className="text-muted-foreground text-[11px] tracking-[0.16em] uppercase">
          Investigation
        </span>
        <span className="text-primary text-sm font-semibold">
          {incidentRef(incident.number)}
        </span>

        <div className="ml-auto">
          <IncidentActions incident={incident} user={user} />
        </div>
      </header>

      <div className="space-y-2 border-b px-5 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <SeverityBadge severity={incident.severity} />
          <h1 className="text-lg font-semibold">{incident.title}</h1>
          <StatusBadge status={incident.status} />
        </div>

        <dl className="text-muted-foreground flex flex-wrap gap-x-6 gap-y-1 text-[11px] tracking-wide uppercase">
          <div className="flex gap-1.5">
            <dt>Host</dt>
            <dd className="text-foreground normal-case">
              {host?.hostname ?? host?.name ?? 'Unlinked'}
            </dd>
          </div>
          <div className="flex gap-1.5">
            <dt>User</dt>
            <dd className="text-foreground normal-case">
              {primaryAlert?.affectedUser ?? 'Unknown'}
            </dd>
          </div>
          <div className="flex gap-1.5">
            <dt>Tactic</dt>
            <dd className="text-foreground normal-case">
              {tacticLabel(incident.tactic)}
            </dd>
          </div>
          <div className="flex gap-1.5">
            <dt>Assigned</dt>
            <dd className="text-foreground normal-case">
              {incident.investigation?.assignedTo ?? 'Unassigned'}
            </dd>
          </div>
        </dl>
      </div>

      <div className="border-b px-5 py-4">
        <ActivityChart series={activity.series} windowMinutes={activity.windowMinutes} />
      </div>

      <div className="grid flex-1 gap-px lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
        <section className="flex min-w-0 flex-col border-r">
          <h2 className="text-muted-foreground border-b px-4 py-2 text-[10px] tracking-[0.16em] uppercase">
            Event timeline
            {events ? <span className="text-primary ml-2">{events.length}</span> : null}
          </h2>

          {events ? (
            <EventTimeline events={events} />
          ) : (
            <div className="text-muted-foreground px-4 py-8 text-center text-xs">
              No investigation has been opened for this incident yet. Assign
              it to yourself to start one.
            </div>
          )}
        </section>

        <aside className="min-w-0 border-b">
          {correlation && explanation ? (
            <AutomatedAnalysis correlation={correlation} explanation={explanation} />
          ) : (
            <div className="text-muted-foreground px-4 py-8 text-center text-xs">
              Automated analysis runs once an investigation is open.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
