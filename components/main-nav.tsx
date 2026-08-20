'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Boxes,
  FileSearch,
  Gauge,
  ScrollText,
  ShieldAlert,
  Siren,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { hasRole, type User, type UserRole } from '@/lib/types';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  minRole?: UserRole;
};

const ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Gauge },
  { href: '/incidents', label: 'Incidents', icon: ShieldAlert },
  { href: '/alerts', label: 'Alerts', icon: Siren },
  { href: '/assets', label: 'Assets', icon: Boxes },
  { href: '/investigations', label: 'Investigations', icon: FileSearch },
  { href: '/audit', label: 'Audit log', icon: ScrollText },
  { href: '/users', label: 'Users', icon: Users, minRole: 'ADMIN' },
];

export function MainNav({ user }: { user: User }) {
  const pathname = usePathname();

  /*
   * Hiding a link the caller cannot use is a courtesy, not a control: the
   * backend enforces the same roles on every request.
   */
  const visible = ITEMS.filter(
    (item) => !item.minRole || hasRole(user, item.minRole),
  );

  return (
    <nav className="flex flex-col gap-1">
      {visible.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors',
              active
                ? 'bg-accent text-accent-foreground font-medium'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
