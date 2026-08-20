import { Activity, Boxes, Fingerprint, ShieldAlert, Siren } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { StatsOverview } from '@/lib/types';

function Kpi({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone?: 'critical' | 'primary';
}) {
  return (
    <div className="bg-card/60 relative flex-1 border-r px-5 py-3 last:border-r-0">
      <div className="text-muted-foreground flex items-center justify-between text-[10px] tracking-[0.16em] uppercase">
        {label}
        <Icon
          className={cn(
            'size-3.5',
            tone === 'critical'
              ? 'text-severity-critical'
              : tone === 'primary'
                ? 'text-primary'
                : 'text-muted-foreground',
          )}
          aria-hidden
        />
      </div>

      <div
        className={cn(
          'mt-1 text-2xl leading-none font-semibold tabular-nums',
          tone === 'critical' ? 'text-severity-critical' : 'text-foreground',
        )}
      >
        {value}
      </div>

      <div className="text-muted-foreground mt-1.5 text-[11px]">{detail}</div>
    </div>
  );
}

/*
 * Every figure here is a count the API actually returns. The design also
 * carried "Mean TTD" and an "AI coverage" percentage; neither has a source
 * in this system, so they are replaced with open investigations and the
 * critical/high split, which analysts can act on.
 */
export function KpiStrip({ stats }: { stats: StatsOverview }) {
  const { incidents, assets, indicators, investigations } = stats;
  const urgent = incidents.bySeverity.CRITICAL + incidents.bySeverity.HIGH;

  return (
    <div className="grid grid-cols-2 border-b md:grid-cols-3 lg:grid-cols-5">
      <Kpi
        label="Open incidents"
        value={String(incidents.open)}
        detail={`${incidents.bySeverity.CRITICAL} critical / ${incidents.bySeverity.HIGH} high`}
        icon={ShieldAlert}
        tone={incidents.bySeverity.CRITICAL > 0 ? 'critical' : undefined}
      />
      <Kpi
        label="Needs triage"
        value={String(urgent)}
        detail={`${investigations.unassigned} unassigned investigation${
          investigations.unassigned === 1 ? '' : 's'
        }`}
        icon={Siren}
        tone={urgent > 0 ? 'critical' : undefined}
      />
      <Kpi
        label="Investigations"
        value={String(investigations.open)}
        detail="open or in progress"
        icon={Activity}
        tone="primary"
      />
      <Kpi
        label="Assets"
        value={String(assets.active)}
        detail={`${assets.compromised} compromised / ${assets.quarantined} quarantined`}
        icon={Boxes}
        tone={assets.compromised > 0 ? 'critical' : undefined}
      />
      <Kpi
        label="Indicators"
        value={String(indicators.total)}
        detail="IP, domain, URL and hash evidence"
        icon={Fingerprint}
        tone="primary"
      />
    </div>
  );
}
