import Link from 'next/link';
import { ArrowLeft, ShieldOff } from 'lucide-react';

import { NewUserForm } from '@/components/new-user-form';
import { hasRole } from '@/lib/types';
import { requireUser } from '@/lib/dal';

export const metadata = {
  title: 'New user — SOC',
};

export default async function NewUserPage() {
  const user = await requireUser();

  if (!hasRole(user, 'ADMIN')) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <ShieldOff className="text-muted-foreground size-8" aria-hidden />
        <p className="text-sm font-medium">Administrator access required.</p>
        <p className="text-muted-foreground max-w-xs text-xs">
          Creating a user account requires the ADMIN role. Your current role
          is {user.role}.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center gap-3 border-b px-5 py-2.5">
        <Link
          href="/users"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-[11px] tracking-[0.14em] uppercase transition-colors"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Users
        </Link>
        <span className="text-sm font-semibold tracking-[0.1em] uppercase">
          New user
        </span>
      </header>

      <NewUserForm />
    </div>
  );
}
