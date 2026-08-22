import { ShieldOff } from 'lucide-react';

import { FilterPills } from '@/components/filter-pills';
import { Pagination } from '@/components/pagination';
import { UserTable } from '@/components/user-table';
import { api } from '@/lib/api';
import { requireUser } from '@/lib/dal';
import { hasRole, type Paginated, type User, type UserRole } from '@/lib/types';

export const metadata = {
  title: 'Users — SOC',
};

export const dynamic = 'force-dynamic';

const ROLES: UserRole[] = ['VIEWER', 'ANALYST', 'ADMIN'];
const TAKE = 25;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const currentUser = await requireUser();

  /*
   * The nav already hides this link for a non-ADMIN, but a hidden link is
   * not access control — the backend rejects this call with a 403, so the
   * page checks first and shows a clear reason rather than letting an
   * ApiError bubble into the framework's generic error boundary.
   */
  if (!hasRole(currentUser, 'ADMIN')) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <ShieldOff className="text-muted-foreground size-8" aria-hidden />
        <p className="text-sm font-medium">Administrator access required.</p>
        <p className="text-muted-foreground max-w-xs text-xs">
          User management is limited to the ADMIN role. Your current role is{' '}
          {currentUser.role}.
        </p>
      </div>
    );
  }

  const params = await searchParams;
  const skip = Number(params.skip ?? 0) || 0;

  const query = new URLSearchParams({ take: String(TAKE), skip: String(skip) });
  if (params.role) query.set('role', params.role);

  const users = await api<Paginated<User>>(`/auth/users?${query}`);

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex flex-wrap items-center gap-4 border-b px-5 py-3">
        <h1 className="text-sm font-semibold tracking-[0.1em] uppercase">
          Users
          <span className="text-primary ml-2">{users.meta.total}</span>
        </h1>

        <div className="ml-auto">
          <FilterPills
            param="role"
            active={params.role}
            options={ROLES}
            basePath="/users"
            searchParams={params}
          />
        </div>
      </header>

      <UserTable
        users={users.data.map((user) => ({
          ...user,
          lastLoginLabel: user.lastLoginAt
            ? new Date(user.lastLoginAt).toLocaleString()
            : 'Never',
        }))}
        currentUserId={currentUser.id}
      />

      <Pagination
        total={users.meta.total}
        skip={users.meta.skip}
        take={users.meta.take}
        basePath="/users"
        searchParams={params}
      />
    </div>
  );
}
