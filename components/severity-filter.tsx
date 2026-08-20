'use client';

import Link from 'next/link';

import { cn } from '@/lib/utils';
import type { Severity } from '@/lib/types';

const OPTIONS: Severity[] = ['CRITICAL', 'HIGH', 'MEDIUM'];

const ACTIVE_STYLES: Record<Severity, string> = {
  CRITICAL: 'bg-severity-critical/20 text-severity-critical border-severity-critical',
  HIGH: 'bg-severity-high/20 text-severity-high border-severity-high',
  MEDIUM: 'bg-severity-medium/20 text-severity-medium border-severity-medium',
  LOW: 'bg-severity-low/20 text-severity-low border-severity-low',
};

/*
 * Links rather than buttons: the filter is part of the URL, so a filtered
 * queue can be shared in a handover and survives a refresh.
 *
 * The API filters on one severity at a time, so these behave as a single
 * choice — clicking the active one clears it.
 */
export function SeverityFilter({ active }: { active?: Severity }) {
  return (
    <div className="flex items-center gap-1.5">
      {OPTIONS.map((severity) => {
        const selected = active === severity;

        return (
          <Link
            key={severity}
            href={selected ? '/dashboard' : `/dashboard?severity=${severity}`}
            aria-pressed={selected}
            className={cn(
              'border px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase transition-colors',
              selected
                ? ACTIVE_STYLES[severity]
                : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/40',
            )}
          >
            {severity}
          </Link>
        );
      })}
    </div>
  );
}
