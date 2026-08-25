import { deleteAsset } from '@/app/actions/assets';
import { DeleteButton } from '@/components/delete-button';
import { MonitoredUrlEditor } from '@/components/monitored-url-editor';
import { cn } from '@/lib/utils';
import type { Asset, AssetStatus } from '@/lib/types';

const STATUS_STYLES: Record<AssetStatus, string> = {
  ACTIVE: 'bg-muted text-foreground/80 border-border',
  COMPROMISED:
    'bg-severity-critical/15 text-severity-critical border-severity-critical/50',
  QUARANTINED:
    'bg-severity-high/15 text-severity-high border-severity-high/50',
  INACTIVE: 'bg-transparent text-muted-foreground border-border/60',
  DECOMMISSIONED: 'bg-transparent text-muted-foreground border-border/60',
};

function AssetStatusBadge({ status }: { status: AssetStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center border px-2 py-0.5 text-[10px] font-semibold tracking-[0.1em] uppercase',
        STATUS_STYLES[status],
      )}
    >
      {status}
    </span>
  );
}

export function AssetTable({
  assets,
  canWrite = false,
  canDelete = false,
}: {
  assets: Asset[];
  canWrite?: boolean;
  canDelete?: boolean;
}) {
  if (assets.length === 0) {
    return (
      <div className="text-muted-foreground px-4 py-10 text-center text-sm">
        No assets match the current filter.
      </div>
    );
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="text-muted-foreground border-b text-[10px] tracking-[0.14em] uppercase">
          <th className="w-32 px-4 py-2 text-left font-normal">Status</th>
          <th className="px-2 py-2 text-left font-normal">Asset</th>
          <th className="w-32 px-2 py-2 text-left font-normal">Type</th>
          <th className="w-40 px-4 py-2 text-right font-normal">IP address</th>
          <th className="w-64 px-4 py-2 text-left font-normal">Monitored URL</th>
          {canDelete ? <th className="w-20 px-2 py-2" /> : null}
        </tr>
      </thead>

      <tbody>
        {assets.map((asset) => (
          <tr key={asset.id} className="hover:bg-accent/40 border-b">
            <td className="px-4 py-2.5 align-top">
              <AssetStatusBadge status={asset.status} />
            </td>

            <td className="px-2 py-2.5 align-top">
              <div className="leading-tight">{asset.hostname ?? asset.name}</div>
              {asset.hostname && asset.hostname !== asset.name ? (
                <div className="text-muted-foreground mt-0.5 text-[11px]">
                  {asset.name}
                </div>
              ) : null}
            </td>

            <td className="text-muted-foreground px-2 py-2.5 align-top text-[11px] uppercase">
              {asset.type.replaceAll('_', ' ')}
            </td>

            <td className="text-muted-foreground px-4 py-2.5 text-right align-top text-[11px] tabular-nums">
              {asset.ipAddress ?? '—'}
            </td>

            <td className="px-4 py-2.5 align-top text-[11px]">
              <MonitoredUrlEditor
                assetId={asset.id}
                monitoredUrl={asset.monitoredUrl}
                canWrite={canWrite}
              />
            </td>

            {canDelete ? (
              <td className="px-2 py-2.5 text-right align-top">
                <DeleteButton action={deleteAsset.bind(null, asset.id)} />
              </td>
            ) : null}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
