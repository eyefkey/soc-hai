import { Check, Sparkles } from 'lucide-react';

import type { CorrelationResult, Explanation } from '@/lib/types';
import { cn } from '@/lib/utils';

const LEVEL_TONE: Record<string, string> = {
  CRITICAL: 'text-severity-critical',
  HIGH: 'text-severity-high',
  MEDIUM: 'text-severity-medium',
  LOW: 'text-severity-low',
};

/*
 * The design this mirrors calls this panel "AI Triage Analysis" and shows
 * threat-actor attribution and a live VirusTotal lookup. Neither is
 * computed anywhere in this system — inventing "APT29 (conf. 73%)" for an
 * analyst working a live incident would be a fabricated finding, not a
 * placeholder. This shows what the backend actually derives: the
 * correlation rules that fired and the risk factors behind the score.
 */
export function AutomatedAnalysis({
  correlation,
  explanation,
}: {
  correlation: CorrelationResult;
  explanation: Explanation;
}) {
  const sourceTypes = new Set(correlation.correlations.map((c) => c.type));

  const checks = [
    correlation.correlations.length > 0
      ? `Correlated ${correlation.correlations.length} related event${
          correlation.correlations.length === 1 ? '' : 's'
        } across ${sourceTypes.size} rule${sourceTypes.size === 1 ? '' : 's'}`
      : null,
    `Risk scored ${correlation.risk.score}/100 from ${correlation.risk.factors.length} factor${
      correlation.risk.factors.length === 1 ? '' : 's'
    }`,
    correlation.correlations.some((c) => c.type === 'INVESTIGATION_FINDING')
      ? 'High-confidence finding on file for this investigation'
      : null,
  ].filter((line): line is string => Boolean(line));

  return (
    <div className="space-y-4 px-4 py-3">
      <div className="flex items-center gap-2">
        <Sparkles className="text-primary size-4" aria-hidden />
        <h3 className="text-[11px] tracking-[0.16em] uppercase">
          Automated analysis
        </h3>
        <span
          className={cn(
            'ml-auto text-xs font-semibold tabular-nums',
            LEVEL_TONE[explanation.risk.level] ?? 'text-foreground',
          )}
        >
          {explanation.risk.score}/100 · {explanation.risk.level}
        </span>
      </div>

      <ul className="space-y-1.5">
        {checks.map((line) => (
          <li key={line} className="flex items-start gap-2 text-sm">
            <Check className="text-primary mt-0.5 size-3.5 shrink-0" aria-hidden />
            <span>{line}</span>
          </li>
        ))}
      </ul>

      <div className="space-y-2 border-t pt-3">
        <h4 className="text-muted-foreground text-[10px] tracking-[0.14em] uppercase">
          Assessment
        </h4>
        <p className="text-sm leading-relaxed">{explanation.explanation.summary}</p>

        {explanation.explanation.factors.length > 0 ? (
          <ul className="text-muted-foreground list-inside list-disc space-y-0.5 text-xs">
            {explanation.explanation.factors.map((factor) => (
              <li key={factor}>{factor}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
