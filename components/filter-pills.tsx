import Link from 'next/link';

import { cn } from '@/lib/utils';

/*
 * A single-select pill group backed by one URL query parameter — the same
 * pattern as the dashboard's severity filter, generalised to any param
 * name and option list so each list page does not reimplement it.
 *
 * Changing a filter resets paging (skip is dropped), since page 3 of an
 * unfiltered list is rarely page 3 of a filtered one.
 */
export function FilterPills({
  param,
  active,
  options,
  basePath,
  searchParams,
  activeClassName,
}: {
  param: string;
  active?: string;
  options: readonly string[];
  basePath: string;
  searchParams: Record<string, string | undefined>;
  activeClassName?: string;
}) {
  const hrefFor = (value?: string) => {
    const params = new URLSearchParams(
      Object.entries(searchParams).filter((entry): entry is [string, string] =>
        Boolean(entry[1]) && entry[0] !== 'skip',
      ),
    );

    if (value) {
      params.set(param, value);
    } else {
      params.delete(param);
    }

    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {options.map((value) => {
        const selected = active === value;

        return (
          <Link
            key={value}
            href={hrefFor(selected ? undefined : value)}
            aria-pressed={selected}
            className={cn(
              'border px-2.5 py-1 text-[10px] font-semibold tracking-[0.1em] uppercase transition-colors',
              selected
                ? (activeClassName ?? 'bg-primary/20 text-primary border-primary')
                : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/40',
            )}
          >
            {value.replaceAll('_', ' ')}
          </Link>
        );
      })}
    </div>
  );
}
