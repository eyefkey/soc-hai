import { deleteFinding } from '@/app/actions/findings';
import { AddFindingForm } from '@/components/add-finding-form';
import { DeleteButton } from '@/components/delete-button';
import { cn } from '@/lib/utils';
import type { Finding } from '@/lib/types';

const CONFIDENCE_TONE: Record<Finding['confidence'], string> = {
  HIGH: 'text-severity-critical',
  MEDIUM: 'text-severity-medium',
  LOW: 'text-muted-foreground',
};

export function FindingsSection({
  investigationId,
  incidentId,
  findings,
  canWrite,
  canDelete,
}: {
  investigationId: string;
  incidentId: string;
  findings: Finding[];
  canWrite: boolean;
  canDelete: boolean;
}) {
  return (
    <section className="border-b">
      <h2 className="text-muted-foreground border-b px-4 py-2 text-[10px] tracking-[0.16em] uppercase">
        Findings
        <span className="text-primary ml-2">{findings.length}</span>
      </h2>

      {findings.length === 0 ? (
        <div className="text-muted-foreground px-4 py-4 text-center text-xs">
          No findings recorded yet.
        </div>
      ) : (
        <ul className="divide-y">
          {findings.map((finding) => (
            <li key={finding.id} className="space-y-1 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{finding.title}</span>
                    <span
                      className={cn(
                        'text-[10px] font-semibold tracking-[0.08em] uppercase',
                        CONFIDENCE_TONE[finding.confidence],
                      )}
                    >
                      {finding.confidence}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                    {finding.description}
                  </p>
                  {finding.impact ? (
                    <p className="mt-1 text-xs">
                      <span className="text-muted-foreground">Impact: </span>
                      {finding.impact}
                    </p>
                  ) : null}
                  {finding.recommendation ? (
                    <p className="text-xs">
                      <span className="text-muted-foreground">
                        Recommendation:{' '}
                      </span>
                      {finding.recommendation}
                    </p>
                  ) : null}
                </div>

                {canDelete ? (
                  <DeleteButton
                    action={deleteFinding.bind(
                      null,
                      investigationId,
                      incidentId,
                      finding.id,
                    )}
                    className="shrink-0"
                  />
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {canWrite ? (
        <AddFindingForm
          investigationId={investigationId}
          incidentId={incidentId}
        />
      ) : null}
    </section>
  );
}
