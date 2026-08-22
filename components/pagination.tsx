import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/*
 * Links, not buttons with an onClick — skip/take live in the URL, so a
 * page mid-list survives a refresh and can be shared or bookmarked, the
 * same reasoning as the severity filter on the dashboard.
 */
export function Pagination({
  total,
  skip,
  take,
  basePath,
  searchParams,
}: {
  total: number;
  skip: number;
  take: number;
  basePath: string;
  /*
   * The filters currently applied, so paging preserves them instead of
   * resetting the list to unfiltered.
   */
  searchParams: Record<string, string | undefined>;
}) {
  const from = total === 0 ? 0 : skip + 1;
  const to = Math.min(skip + take, total);

  const hrefFor = (nextSkip: number) => {
    const params = new URLSearchParams(
      Object.entries(searchParams).filter((entry): entry is [string, string] =>
        Boolean(entry[1]),
      ),
    );
    params.set('skip', String(nextSkip));
    return `${basePath}?${params.toString()}`;
  };

  return (
    <div className="text-muted-foreground flex items-center justify-between border-t px-4 py-2 text-[11px] tabular-nums">
      <span>
        {from}–{to} of {total}
      </span>

      <div className="flex items-center gap-1">
        <Link
          aria-disabled={skip === 0}
          href={hrefFor(Math.max(0, skip - take))}
          className={cn(
            buttonVariants({ variant: 'outline', size: 'sm' }),
            'h-7 px-2',
            skip === 0 && 'pointer-events-none opacity-40',
          )}
        >
          <ChevronLeft className="size-3.5" aria-hidden />
          Prev
        </Link>

        <Link
          aria-disabled={to >= total}
          href={hrefFor(skip + take)}
          className={cn(
            buttonVariants({ variant: 'outline', size: 'sm' }),
            'h-7 px-2',
            to >= total && 'pointer-events-none opacity-40',
          )}
        >
          Next
          <ChevronRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
