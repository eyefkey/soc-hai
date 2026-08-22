'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { Power, PowerOff } from 'lucide-react';

import { setUserActive, updateUserRole } from '@/app/actions/users';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { User, UserRole } from '@/lib/types';

const ROLES: UserRole[] = ['VIEWER', 'ANALYST', 'ADMIN'];

function RolePicker({
  user,
  disabled,
  onChange,
}: {
  user: User;
  disabled: boolean;
  onChange: (role: UserRole) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {ROLES.map((role) => {
        const selected = user.role === role;

        return (
          <button
            key={role}
            type="button"
            disabled={disabled || selected}
            onClick={() => onChange(role)}
            className={cn(
              'border px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em] uppercase transition-colors disabled:cursor-not-allowed',
              selected
                ? 'bg-primary/20 text-primary border-primary'
                : 'border-border text-muted-foreground enabled:hover:text-foreground enabled:hover:border-foreground/40',
            )}
          >
            {role}
          </button>
        );
      })}
    </div>
  );
}

/*
 * Role changes and deactivation are ADMIN-only on the backend, and the
 * backend also refuses to let an ADMIN demote or disable their own
 * account — the button for that action is disabled here too, so the
 * refusal reads as "you can't do this" rather than a failed request.
 */
export function UserTable({
  users,
  currentUserId,
}: {
  /*
   * lastLoginLabel is pre-formatted by the server rather than derived here
   * from lastLoginAt with toLocaleString(). This is a Client Component, so
   * it is both server-rendered and re-rendered on the client during
   * hydration — and toLocaleString() depends on the runtime's locale and
   * time zone, which can differ between Node on the server and the
   * browser. Formatting it once on the server and handing down the
   * resulting string avoids a hydration mismatch entirely, since the
   * client never recomputes it.
   */
  users: (User & { lastLoginLabel: string })[];
  currentUserId: string;
}) {
  const [pending, startTransition] = useTransition();

  const run = (promise: Promise<{ error?: string }>, success: string) => {
    startTransition(async () => {
      const result = await promise;

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(success);
      }
    });
  };

  if (users.length === 0) {
    return (
      <div className="text-muted-foreground px-4 py-10 text-center text-sm">
        No users match the current filter.
      </div>
    );
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="text-muted-foreground border-b text-[10px] tracking-[0.14em] uppercase">
          <th className="px-4 py-2 text-left font-normal">User</th>
          <th className="w-56 px-2 py-2 text-left font-normal">Role</th>
          <th className="w-32 px-2 py-2 text-left font-normal">Last login</th>
          <th className="w-24 px-4 py-2 text-right font-normal">Status</th>
        </tr>
      </thead>

      <tbody>
        {users.map((user) => {
          const isSelf = user.id === currentUserId;

          return (
            <tr key={user.id} className="border-b">
              <td className="px-4 py-2.5 align-top">
                <div className="leading-tight">{user.username}</div>
                <div className="text-muted-foreground mt-0.5 text-[11px]">
                  {user.email}
                </div>
              </td>

              <td className="px-2 py-2.5 align-top">
                <RolePicker
                  user={user}
                  disabled={pending || isSelf}
                  onChange={(role) =>
                    run(updateUserRole(user.id, role), `${user.username} is now ${role}.`)
                  }
                />
              </td>

              <td className="text-muted-foreground px-2 py-2.5 align-top text-[11px] tabular-nums">
                {user.lastLoginLabel}
              </td>

              <td className="px-4 py-2.5 text-right align-top">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pending || isSelf}
                  onClick={() =>
                    run(
                      setUserActive(user.id, !user.isActive),
                      user.isActive
                        ? `${user.username} deactivated.`
                        : `${user.username} reactivated.`,
                    )
                  }
                  className={cn(
                    'h-7 gap-1.5 px-2 text-[10px] tracking-wider uppercase',
                    user.isActive ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  {user.isActive ? (
                    <Power className="size-3.5" aria-hidden />
                  ) : (
                    <PowerOff className="size-3.5" aria-hidden />
                  )}
                  {user.isActive ? 'Active' : 'Disabled'}
                </Button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
