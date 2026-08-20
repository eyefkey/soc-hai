import { cn } from '@/lib/utils';
import type { IncidentStatus, Severity } from '@/lib/types';

/*
 * Severity is the first thing an analyst reads on a row, so it gets a solid
 * block of colour rather than a subtle outline.
 */
const SEVERITY_STYLES: Record<Severity, string> = {
  CRITICAL: 'bg-severity-critical/15 text-severity-critical border-severity-critical/50',
  HIGH: 'bg-severity-high/15 text-severity-high border-severity-high/50',
  MEDIUM: 'bg-severity-medium/15 text-severity-medium border-severity-medium/50',
  LOW: 'bg-severity-low/15 text-severity-low border-severity-low/40',
};

export function SeverityBadge({
  severity,
  className,
}: {
  severity: Severity;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex min-w-[4.5rem] items-center justify-center border px-2 py-0.5 text-[10px] font-semibold tracking-[0.12em] uppercase',
        SEVERITY_STYLES[severity],
        className,
      )}
    >
      {severity}
    </span>
  );
}

/*
 * Status is secondary information, so it stays monochrome except where it
 * signals that someone is actively working the incident.
 */
const STATUS_STYLES: Record<IncidentStatus, string> = {
  OPEN: 'bg-muted text-foreground/80 border-border',
  INVESTIGATING: 'bg-primary/15 text-primary border-primary/50',
  CONTAINED: 'bg-severity-medium/10 text-severity-medium border-severity-medium/40',
  RESOLVED: 'bg-muted text-muted-foreground border-border',
  CLOSED: 'bg-transparent text-muted-foreground border-border/60',
};

export function StatusBadge({
  status,
  className,
}: {
  status: IncidentStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center border px-2 py-0.5 text-[10px] font-semibold tracking-[0.1em] uppercase',
        STATUS_STYLES[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
