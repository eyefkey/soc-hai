import type { AuditLogEntry } from '@/lib/types';

const ACTION_TONE: Record<string, string> = {
  CREATED: 'text-severity-info',
  DELETED: 'text-severity-critical',
  STATUS_CHANGED: 'text-primary',
  UPDATED: 'text-muted-foreground',
  ATTACHED: 'text-severity-medium',
  DETACHED: 'text-severity-medium',
};

export function AuditTable({ entries }: { entries: AuditLogEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="text-muted-foreground px-4 py-10 text-center text-sm">
        No audit entries match the current filter.
      </div>
    );
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="text-muted-foreground border-b text-[10px] tracking-[0.14em] uppercase">
          <th className="w-44 px-4 py-2 text-left font-normal">Time</th>
          <th className="w-28 px-2 py-2 text-left font-normal">Entity</th>
          <th className="w-32 px-2 py-2 text-left font-normal">Action</th>
          <th className="px-2 py-2 text-left font-normal">Description</th>
          <th className="w-28 px-4 py-2 text-right font-normal">User</th>
        </tr>
      </thead>

      <tbody>
        {entries.map((entry) => (
          <tr key={entry.id} className="hover:bg-accent/40 border-b">
            <td className="text-muted-foreground px-4 py-2.5 align-top text-[11px] tabular-nums">
              {new Date(entry.createdAt).toLocaleString()}
            </td>

            <td className="text-muted-foreground px-2 py-2.5 align-top text-[11px] uppercase">
              {entry.entity}
            </td>

            <td
              className={`px-2 py-2.5 align-top text-[11px] font-semibold tracking-wide uppercase ${
                ACTION_TONE[entry.action] ?? 'text-foreground'
              }`}
            >
              {entry.action}
            </td>

            <td className="px-2 py-2.5 align-top">{entry.description ?? '—'}</td>

            <td className="text-muted-foreground px-4 py-2.5 text-right align-top text-xs">
              {entry.username ?? 'system'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
