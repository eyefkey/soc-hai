import { deleteEvidence } from '@/app/actions/evidence';
import { AddEvidenceForm } from '@/components/add-evidence-form';
import { DeleteButton } from '@/components/delete-button';
import type { Evidence } from '@/lib/types';

export function EvidenceSection({
  incidentId,
  evidence,
  canWrite,
  canDelete,
}: {
  incidentId: string;
  evidence: Evidence[];
  canWrite: boolean;
  canDelete: boolean;
}) {
  return (
    <section className="border-b">
      <h2 className="text-muted-foreground border-b px-4 py-2 text-[10px] tracking-[0.16em] uppercase">
        Evidence
        <span className="text-primary ml-2">{evidence.length}</span>
      </h2>

      {evidence.length === 0 ? (
        <div className="text-muted-foreground px-4 py-4 text-center text-xs">
          No evidence collected yet.
        </div>
      ) : (
        <ul className="divide-y">
          {evidence.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 px-4 py-2.5"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-[10px] font-semibold tracking-[0.1em] uppercase">
                    [{item.type.replaceAll('_', ' ')}]
                  </span>
                  <span className="truncate text-sm">{item.value}</span>
                </div>
                {item.description ? (
                  <p className="text-muted-foreground mt-0.5 text-[11px]">
                    {item.description}
                  </p>
                ) : null}
              </div>

              {canDelete ? (
                <DeleteButton
                  action={deleteEvidence.bind(null, incidentId, item.id)}
                  className="shrink-0"
                />
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {canWrite ? <AddEvidenceForm incidentId={incidentId} /> : null}
    </section>
  );
}
