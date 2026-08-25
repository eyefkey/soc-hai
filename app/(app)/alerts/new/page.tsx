import Link from 'next/link';
import { ArrowLeft, ShieldOff } from 'lucide-react';

import { NewAlertForm } from '@/components/new-alert-form';
import { hasRole } from '@/lib/types';
import { requireUser } from '@/lib/dal';

export const metadata = {
  title: 'New alert — SOC',
};

export default async function NewAlertPage({
  searchParams,
}: {
  searchParams: Promise<{ incidentId?: string }>;
}) {
  const user = await requireUser();
  const { incidentId } = await searchParams;

  if (!hasRole(user, 'ANALYST')) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <ShieldOff className="text-muted-foreground size-8" aria-hidden />
        <p className="text-sm font-medium">Analyst access required.</p>
        <p className="text-muted-foreground max-w-xs text-xs">
          Creating an alert requires the ANALYST role or higher. Your current
          role is {user.role}.
        </p>
      </div>
    );
  }

  const backHref = incidentId ? `/incidents/${incidentId}` : '/alerts';

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center gap-3 border-b px-5 py-2.5">
        <Link
          href={backHref}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-[11px] tracking-[0.14em] uppercase transition-colors"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          {incidentId ? 'Incident' : 'Alerts'}
        </Link>
        <span className="text-sm font-semibold tracking-[0.1em] uppercase">
          New alert
        </span>
      </header>

      <NewAlertForm incidentId={incidentId} />
    </div>
  );
}
