'use client';

import Link from 'next/link';

import { SeverityBadge, StatusBadge } from '@/components/severity-badge';
import { useNow } from '@/lib/use-now';
import { cn } from '@/lib/utils';
import { age, incidentRef, tacticLabel, type Incident } from '@/lib/types';

export function IncidentQueue({ incidents }: { incidents: Incident[] }) {
  const now = useNow();

  if (incidents.length === 0) {
    return (
      <div className="text-muted-foreground px-4 py-10 text-center text-sm">
        No incidents match the current filter.
      </div>
    );
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="text-muted-foreground border-b text-[10px] tracking-[0.14em] uppercase">
          <th className="w-28 px-4 py-2 text-left font-normal">Severity</th>
          <th className="px-2 py-2 text-left font-normal">Incident</th>
          <th className="w-32 px-2 py-2 text-left font-normal">Status</th>
          <th className="w-24 px-4 py-2 text-right font-normal">Age</th>
        </tr>
      </thead>

      <tbody>
        {incidents.map((incident) => {
          const host = incident.assets?.[0]?.asset;
          const closed =
            incident.status === 'CLOSED' || incident.status === 'RESOLVED';

          return (
            <tr
              key={incident.id}
              className={cn(
                'hover:bg-accent/40 group border-b transition-colors',
                closed && 'opacity-55',
              )}
            >
              <td className="px-4 py-2.5 align-top">
                <SeverityBadge severity={incident.severity} />
              </td>

              <td className="px-2 py-2.5 align-top">
                <Link
                  href={`/incidents/${incident.id}`}
                  className="group-hover:text-primary block leading-tight transition-colors"
                >
                  {incident.title}
                </Link>
                <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
                  <span className="text-primary/80">
                    {incidentRef(incident.number)}
                  </span>
                  {host ? <span>{host.hostname ?? host.name}</span> : null}
                  <span>{tacticLabel(incident.tactic)}</span>
                </div>
              </td>

              <td className="px-2 py-2.5 align-top">
                <StatusBadge status={incident.status} />
              </td>

              <td className="text-muted-foreground px-4 py-2.5 text-right align-top tabular-nums">
                {/*
                  Blank until the client clock starts, so server and client
                  render the same markup.
                */}
                {now === null ? '--:--:--' : age(incident.createdAt, now)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
