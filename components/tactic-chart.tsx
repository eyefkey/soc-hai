import { tacticLabel, type MitreTactic } from '@/lib/types';

/*
 * MITRE ATT&CK tactic distribution over the last 24 hours. Tactic is now a
 * real field on alerts, so this is a group-by rather than a guess.
 */
export function TacticChart({
  tactics,
}: {
  tactics: { tactic: MitreTactic; count: number }[];
}) {
  const shown = tactics.slice(0, 8);
  const peak = Math.max(1, ...shown.map((row) => row.count));

  if (shown.length === 0) {
    return (
      <div className="text-muted-foreground px-4 py-6 text-center text-xs">
        No tactic-classified alerts in the last 24 hours.
      </div>
    );
  }

  return (
    <div className="flex h-40 items-end gap-3 px-4 pb-2">
      {shown.map(({ tactic, count }) => (
        <div
          key={tactic}
          className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
        >
          <span className="text-primary text-[11px] tabular-nums">{count}</span>

          <div
            className="bg-primary/70 hover:bg-primary w-full transition-colors"
            style={{ height: `${Math.max(4, (count / peak) * 100)}%` }}
            title={`${tacticLabel(tactic)}: ${count}`}
          />

          <span className="text-muted-foreground w-full truncate text-center text-[10px]">
            {tacticLabel(tactic)}
          </span>
        </div>
      ))}
    </div>
  );
}
