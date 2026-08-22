import { AssetTable } from '@/components/asset-table';
import { FilterPills } from '@/components/filter-pills';
import { Pagination } from '@/components/pagination';
import { api } from '@/lib/api';
import { requireUser } from '@/lib/dal';
import type { Asset, AssetStatus, Paginated } from '@/lib/types';

export const metadata = {
  title: 'Assets — SOC',
};

export const dynamic = 'force-dynamic';

const STATUSES: AssetStatus[] = [
  'ACTIVE',
  'COMPROMISED',
  'QUARANTINED',
  'INACTIVE',
  'DECOMMISSIONED',
];

const TAKE = 25;

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireUser();

  const params = await searchParams;
  const skip = Number(params.skip ?? 0) || 0;

  const query = new URLSearchParams({ take: String(TAKE), skip: String(skip) });
  if (params.status) query.set('status', params.status);

  const assets = await api<Paginated<Asset>>(`/assets?${query}`);

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex flex-wrap items-center gap-4 border-b px-5 py-3">
        <h1 className="text-sm font-semibold tracking-[0.1em] uppercase">
          Assets
          <span className="text-primary ml-2">{assets.meta.total}</span>
        </h1>

        <div className="ml-auto">
          <FilterPills
            param="status"
            active={params.status}
            options={STATUSES}
            basePath="/assets"
            searchParams={params}
          />
        </div>
      </header>

      <AssetTable assets={assets.data} />

      <Pagination
        total={assets.meta.total}
        skip={assets.meta.skip}
        take={assets.meta.take}
        basePath="/assets"
        searchParams={params}
      />
    </div>
  );
}
