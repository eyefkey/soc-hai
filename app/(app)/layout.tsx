import { ShieldCheck } from 'lucide-react';

import { MainNav } from '@/components/main-nav';
import { UserMenu } from '@/components/user-menu';
import { Separator } from '@/components/ui/separator';
import { requireUser } from '@/lib/dal';

/*
 * Every page inside this group is authenticated. requireUser asks the
 * backend rather than trusting the cookie, so a disabled account is bounced
 * here even though the proxy let the request through.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="flex min-h-svh">
      <aside className="bg-sidebar hidden w-60 shrink-0 flex-col border-r p-3 md:flex">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-md">
            <ShieldCheck className="size-4" aria-hidden />
          </div>
          <span className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-[0.18em]">AEGIS</span>
            <span className="text-muted-foreground text-[9px] tracking-[0.2em] uppercase">
              SOC Platform
            </span>
          </span>
        </div>

        <Separator className="my-2" />

        <div className="flex-1 overflow-y-auto">
          <MainNav user={user} />
        </div>

        <Separator className="my-2" />

        <UserMenu user={user} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b px-4 py-3 md:hidden">
          <ShieldCheck className="text-primary size-5" aria-hidden />
          <span className="text-sm font-semibold tracking-[0.18em]">AEGIS</span>
          <div className="ml-auto w-40">
            <UserMenu user={user} />
          </div>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
