import Link from 'next/link';

import { StatusBadge } from '@/components/severity-badge';
import { incidentRef, type Incident, type Investigation } from '@/lib/types';

type InvestigationRow = Investigation & { incident: Incident };

export function InvestigationTable({
  investigations,
}: {
  investigations: InvestigationRow[];
}) {
  if (investigations.length === 0) {
    return (
      <div className="text-muted-foreground px-4 py-10 text-center text-sm">
        No investigations match the current filter.
      </div>
    );
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="text-muted-foreground border-b text-[10px] tracking-[0.14em] uppercase">
          <th className="w-32 px-4 py-2 text-left font-normal">Status</th>
          <th className="px-2 py-2 text-left font-normal">Incident</th>
          <th className="w-32 px-2 py-2 text-left font-normal">Assigned</th>
          <th className="w-44 px-4 py-2 text-right font-normal">Started</th>
        </tr>
      </thead>

      <tbody>
        {investigations.map((investigation) => (
          <tr key={investigation.id} className="hover:bg-accent/40 group border-b">
            <td className="px-4 py-2.5 align-top">
              <StatusBadge status={investigation.status} />
            </td>

            <td className="px-2 py-2.5 align-top">
              <Link
                href={`/incidents/${investigation.incident.id}`}
                className="group-hover:text-primary block leading-tight transition-colors"
              >
                {investigation.incident.title}
              </Link>
              <span className="text-primary/80 mt-1 block text-[11px]">
                {incidentRef(investigation.incident.number)}
              </span>
            </td>

            <td className="px-2 py-2.5 align-top text-xs">
              {investigation.assignedTo ?? (
                <span className="text-muted-foreground">Unassigned</span>
              )}
            </td>

            <td className="text-muted-foreground px-4 py-2.5 text-right align-top text-[11px] tabular-nums">
              {new Date(investigation.startedAt).toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
