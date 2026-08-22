'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { ArrowUpCircle, CircleCheck, UserPlus } from 'lucide-react';

import { assignToMe, closeIncident, escalateIncident } from '@/app/actions/incidents';
import { Button } from '@/components/ui/button';
import { hasRole, type Incident, type User } from '@/lib/types';

/*
 * All three actions write to the incident (and sometimes its
 * investigation), so they are gated the same way the API gates
 * PATCH /incidents/:id — ANALYST or higher. A VIEWER simply does not see
 * them, which matches the nav's treatment of role-restricted entries.
 */
export function IncidentActions({
  incident,
  user,
}: {
  incident: Incident;
  user: User;
}) {
  const [pending, startTransition] = useTransition();

  if (!hasRole(user, 'ANALYST')) {
    return null;
  }

  const run = (
    action: (id: string) => Promise<{ error?: string }>,
    successMessage: string,
  ) => {
    startTransition(async () => {
      const result = await action(incident.id);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(successMessage);
      }
    });
  };

  const closed = incident.status === 'CLOSED' || incident.status === 'RESOLVED';
  const alreadyAssignedToMe = incident.investigation?.assignedTo === user.username;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={pending || closed || incident.severity === 'CRITICAL'}
        onClick={() => run(escalateIncident, 'Incident escalated.')}
        className="border-severity-critical/50 text-severity-critical hover:bg-severity-critical/10 hover:text-severity-critical"
      >
        <ArrowUpCircle className="size-3.5" aria-hidden />
        Escalate
      </Button>

      <Button
        variant="outline"
        size="sm"
        disabled={pending || closed || alreadyAssignedToMe}
        onClick={() => run(assignToMe, 'Assigned to you.')}
      >
        <UserPlus className="size-3.5" aria-hidden />
        {alreadyAssignedToMe ? 'Assigned to you' : 'Assign to me'}
      </Button>

      <Button
        size="sm"
        disabled={pending || closed}
        onClick={() => run(closeIncident, 'Incident closed.')}
        className="bg-severity-medium text-background hover:bg-severity-medium/90"
      >
        <CircleCheck className="size-3.5" aria-hidden />
        Close
      </Button>
    </div>
  );
}
