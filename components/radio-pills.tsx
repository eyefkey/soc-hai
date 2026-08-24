'use client';

import { cn } from '@/lib/utils';

/*
 * Native radio inputs styled as pills, rather than a controlled React
 * value — a plain HTML radio group works with browser-native `required`
 * validation and submits through FormData without any state wiring, which
 * is what a form driven by useActionState needs.
 */
/*
 * Each class needs its own peer-checked: prefix — Tailwind variants apply
 * per-utility, not to a whole space-separated string — so the active
 * classes are given already-prefixed rather than composed at render time.
 */
const DEFAULT_ACTIVE =
  'peer-checked:bg-primary/20 peer-checked:text-primary peer-checked:border-primary';

export function RadioPills({
  name,
  options,
  defaultValue,
  required,
  activeClassName = DEFAULT_ACTIVE,
}: {
  name: string;
  options: readonly string[];
  defaultValue?: string;
  required?: boolean;
  activeClassName?: string;
}) {
  return (
    <div role="radiogroup" className="flex flex-wrap gap-1.5">
      {options.map((value) => (
        <label key={value} className="cursor-pointer">
          <input
            type="radio"
            name={name}
            value={value}
            defaultChecked={defaultValue === value}
            required={required}
            className="peer sr-only"
          />
          <span
            className={cn(
              'border px-2.5 py-1 text-[10px] font-semibold tracking-[0.1em] uppercase transition-colors',
              'border-border text-muted-foreground peer-hover:text-foreground peer-hover:border-foreground/40',
              activeClassName,
            )}
          >
            {value.replaceAll('_', ' ')}
          </span>
        </label>
      ))}
    </div>
  );
}
