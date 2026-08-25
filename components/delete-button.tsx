'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check, LoaderCircle, Trash2, Unlink, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/*
 * Icon and copy are chosen from a string variant rather than accepted as
 * props (e.g. icon={Unlink}), because a component reference is a function
 * — and a Server Component cannot pass a function to a Client Component
 * across the boundary, only serialisable data or a bound server action.
 * The variant name crosses fine; the lookup happens inside this module,
 * which is already a Client Component.
 */
const VARIANTS = {
  delete: { icon: Trash2, label: 'Delete', successMessage: 'Deleted.' },
  unlink: { icon: Unlink, label: 'Unlink', successMessage: 'Unlinked.' },
} as const;

/*
 * A single client island dropped into an otherwise server-rendered table
 * row, rather than converting the whole table to a Client Component for
 * one button. Keeps the table itself immune to the hydration class of bug
 * fixed in the users table — a Server Component's markup is never
 * re-executed on the client, so there is nothing left to mismatch.
 *
 * Confirmation is an inline arm/confirm toggle rather than
 * window.confirm(): a native dialog is unstyled against the rest of the
 * console, and — the reason this was actually caught — automated
 * browser tooling suppresses native dialogs and answers them false,
 * which made the confirmed path impossible to exercise at all. Clicking
 * once arms the button; a second click within a few seconds executes,
 * otherwise it disarms on its own.
 */
const ARM_TIMEOUT_MS = 4000;

export function DeleteButton({
  action,
  variant = 'delete',
  className,
}: {
  action: () => Promise<{ error?: string }>;
  /*
   * 'unlink' reads as "Unlink" rather than "Delete" — nothing is actually
   * destroyed when the action just removes a link between two existing
   * records, which is what a detach action does.
   */
  variant?: keyof typeof VARIANTS;
  className?: string;
}) {
  const { icon: Icon, label, successMessage } = VARIANTS[variant];
  const [armed, setArmed] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const disarm = () => {
    setArmed(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const arm = () => {
    setArmed(true);
    timeoutRef.current = setTimeout(disarm, ARM_TIMEOUT_MS);
  };

  const confirm = () => {
    disarm();

    startTransition(async () => {
      const result = await action();

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(successMessage);
        router.refresh();
      }
    });
  };

  if (armed) {
    return (
      <div className="inline-flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={confirm}
          className="text-severity-critical hover:bg-severity-critical/10 hover:text-severity-critical h-7 gap-1 px-2 text-[10px] tracking-wider uppercase"
        >
          {pending ? (
            <LoaderCircle className="size-3.5 animate-spin" aria-hidden />
          ) : (
            <Check className="size-3.5" aria-hidden />
          )}
          Confirm
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={disarm}
          className="text-muted-foreground h-7 px-2"
        >
          <X className="size-3.5" aria-hidden />
        </Button>
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={arm}
      className={cn(
        'text-muted-foreground hover:text-severity-critical h-7 gap-1 px-2 text-[10px] tracking-wider uppercase',
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {label}
    </Button>
  );
}
