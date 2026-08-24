import Link from 'next/link';
import { ArrowLeft, ShieldOff } from 'lucide-react';

import { NewIncidentForm } from '@/components/new-incident-form';
import { hasRole } from '@/lib/types';
import { requireUser } from '@/lib/dal';

export const metadata = {
  title: 'New incident — SOC',
};

export default async function NewIncidentPage() {
  const user = await requireUser();

  /*
   * The "New incident" link is only rendered for ANALYST and above, but a
   * hidden link is not access control — the backend rejects this call with
   * a 403 for a VIEWER, so the page checks first, matching the pattern
   * used for /users.
   */
  if (!hasRole(user, 'ANALYST')) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <ShieldOff className="text-muted-foreground size-8" aria-hidden />
        <p className="text-sm font-medium">Analyst access required.</p>
        <p className="text-muted-foreground max-w-xs text-xs">
          Creating an incident requires the ANALYST role or higher. Your
          current role is {user.role}.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center gap-3 border-b px-5 py-2.5">
        <Link
          href="/incidents"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-[11px] tracking-[0.14em] uppercase transition-colors"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Incidents
        </Link>
        <span className="text-sm font-semibold tracking-[0.1em] uppercase">
          New incident
        </span>
      </header>

      <NewIncidentForm />
    </div>
  );
}
