import {
  Boxes,
  Fingerprint,
  ScrollText,
  ShieldAlert,
  Siren,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { SeverityBadge } from '@/components/severity-badge';
import { cn } from '@/lib/utils';
import type { InvestigationEvent, Severity } from '@/lib/types';

const TYPE_ICON: Record<InvestigationEvent['type'], LucideIcon> = {
  INCIDENT: ShieldAlert,
  ALERT: Siren,
  EVIDENCE: Fingerprint,
  ASSET: Boxes,
  AUDIT: ScrollText,
};

const TYPE_ACCENT: Record<InvestigationEvent['type'], string> = {
  INCIDENT: 'text-severity-critical',
  ALERT: 'text-severity-high',
  EVIDENCE: 'text-primary',
  ASSET: 'text-severity-info',
  AUDIT: 'text-muted-foreground',
};

/*
 * Every event has a type, but only some (alerts, the founding incident)
 * carry a severity. Events without one show no badge rather than a
 * fabricated default.
 */
function EventSeverity({ severity }: { severity?: Severity }) {
  if (!severity) {
    return null;
  }

  return <SeverityBadge severity={severity} className="min-w-0" />;
}

export function EventTimeline({ events }: { events: InvestigationEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="text-muted-foreground px-4 py-8 text-center text-xs">
        No events recorded yet.
      </div>
    );
  }

  return (
    <ol className="divide-y">
      {events.map((event) => {
        const Icon = TYPE_ICON[event.type];

        return (
          <li key={event.id} className="hover:bg-accent/30 px-4 py-3">
            <div className="flex items-start gap-3">
              <Icon
                className={cn('mt-0.5 size-4 shrink-0', TYPE_ACCENT[event.type])}
                aria-hidden
              />

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-muted-foreground text-[10px] font-semibold tracking-[0.1em] uppercase">
                    [{event.type}]
                  </span>
                  <span className="truncate text-sm">{event.description}</span>
                  <EventSeverity severity={event.severity} />
                </div>

                <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 text-[11px] tabular-nums">
                  <span>{new Date(event.timestamp).toLocaleString()}</span>
                  <span className="uppercase">{event.action}</span>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
