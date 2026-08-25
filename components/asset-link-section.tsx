import Link from 'next/link';

import { detachAsset } from '@/app/actions/assets';
import { AttachAssetForm } from '@/components/attach-asset-form';
import { DeleteButton } from '@/components/delete-button';
import type { Asset } from '@/lib/types';

export function AssetLinkSection({
  incidentId,
  linked,
  available,
  canWrite,
}: {
  incidentId: string;
  linked: Asset[];
  /*
   * The full catalogue minus whatever is already linked, for the attach
   * form's picker.
   */
  available: Asset[];
  canWrite: boolean;
}) {
  return (
    <section className="border-b">
      <h2 className="text-muted-foreground border-b px-4 py-2 text-[10px] tracking-[0.16em] uppercase">
        Linked assets
        <span className="text-primary ml-2">{linked.length}</span>
      </h2>

      {linked.length === 0 ? (
        <div className="text-muted-foreground px-4 py-4 text-center text-xs">
          No assets linked yet.
        </div>
      ) : (
        <ul className="divide-y">
          {linked.map((asset) => (
            <li
              key={asset.id}
              className="flex items-center justify-between gap-3 px-4 py-2"
            >
              <Link
                href="/assets"
                className="hover:text-primary min-w-0 truncate text-sm transition-colors"
              >
                {asset.hostname ?? asset.name}
                {asset.ipAddress ? (
                  <span className="text-muted-foreground ml-2 text-[11px]">
                    {asset.ipAddress}
                  </span>
                ) : null}
              </Link>

              {canWrite ? (
                <DeleteButton
                  action={detachAsset.bind(null, incidentId, asset.id)}
                  variant="unlink"
                  className="shrink-0"
                />
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {canWrite ? (
        <AttachAssetForm incidentId={incidentId} options={available} />
      ) : null}
    </section>
  );
}
