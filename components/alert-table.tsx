import Link from 'next/link';

import { deleteAlert } from '@/app/actions/alerts';
import { DeleteButton } from '@/components/delete-button';
import { SeverityBadge } from '@/components/severity-badge';
import { incidentRef, tacticLabel, type Alert, type Incident } from '@/lib/types';

type AlertRow = Alert & { incident: Incident | null };

export function AlertTable({
  alerts,
  canDelete = false,
}: {
  alerts: AlertRow[];
  canDelete?: boolean;
}) {
  if (alerts.length === 0) {
    return (
      <div className="text-muted-foreground px-4 py-10 text-center text-sm">
        No alerts match the current filter.
      </div>
    );
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="text-muted-foreground border-b text-[10px] tracking-[0.14em] uppercase">
          <th className="w-28 px-4 py-2 text-left font-normal">Severity</th>
          <th className="px-2 py-2 text-left font-normal">Alert</th>
          <th className="w-36 px-2 py-2 text-left font-normal">Incident</th>
          <th className="w-44 px-4 py-2 text-right font-normal">Detected</th>
          {canDelete ? <th className="w-20 px-2 py-2" /> : null}
        </tr>
      </thead>

      <tbody>
        {alerts.map((alert) => (
          <tr key={alert.id} className="hover:bg-accent/40 group border-b">
            <td className="px-4 py-2.5 align-top">
              <SeverityBadge severity={alert.severity} />
            </td>

            <td className="px-2 py-2.5 align-top">
              <div className="leading-tight">{alert.title}</div>
              <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
                {alert.source ? <span>{alert.source}</span> : null}
                {alert.sourceIp ? <span>{alert.sourceIp}</span> : null}
                {alert.targetIp ? <span>&rarr; {alert.targetIp}</span> : null}
                {alert.affectedUser ? <span>{alert.affectedUser}</span> : null}
                <span>{tacticLabel(alert.tactic)}</span>
              </div>
            </td>

            <td className="px-2 py-2.5 align-top">
              {alert.incident ? (
                <Link
                  href={`/incidents/${alert.incident.id}`}
                  className="text-primary/80 hover:text-primary text-xs"
                >
                  {incidentRef(alert.incident.number)}
                </Link>
              ) : (
                <span className="text-muted-foreground text-xs">Unlinked</span>
              )}
            </td>

            <td className="text-muted-foreground px-4 py-2.5 text-right align-top text-[11px] tabular-nums">
              {new Date(alert.createdAt).toLocaleString()}
            </td>

            {canDelete ? (
              <td className="px-2 py-2.5 text-right align-top">
                <DeleteButton action={deleteAlert.bind(null, alert.id)} />
              </td>
            ) : null}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
