'use client';

import { useRouter } from 'next/navigation';

import { tacticLabel, type MitreTactic } from '@/lib/types';

const TACTICS: MitreTactic[] = [
  'RECONNAISSANCE',
  'RESOURCE_DEVELOPMENT',
  'INITIAL_ACCESS',
  'EXECUTION',
  'PERSISTENCE',
  'PRIVILEGE_ESCALATION',
  'DEFENSE_EVASION',
  'CREDENTIAL_ACCESS',
  'DISCOVERY',
  'LATERAL_MOVEMENT',
  'COLLECTION',
  'COMMAND_AND_CONTROL',
  'EXFILTRATION',
  'IMPACT',
];

/*
 * Fourteen tactics as pills, alongside the status and severity rows this
 * sits next to, would turn the header into a wall of buttons — a single
 * select reads calmer for a filter this wide. Filtering resets paging, the
 * same rule FilterPills follows, since page 3 of an unfiltered list is
 * rarely page 3 of a filtered one.
 */
export function TacticSelect({
  active,
  basePath,
  searchParams,
}: {
  active?: string;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  const router = useRouter();

  const onChange = (value: string) => {
    const params = new URLSearchParams(
      Object.entries(searchParams).filter(
        (entry): entry is [string, string] =>
          Boolean(entry[1]) && entry[0] !== 'skip',
      ),
    );

    if (value) {
      params.set('tactic', value);
    } else {
      params.delete('tactic');
    }

    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  };

  return (
    <select
      value={active ?? ''}
      onChange={(event) => onChange(event.target.value)}
      className="border-input bg-transparent h-7 rounded-md border px-2 text-[10px] font-semibold tracking-[0.08em] uppercase"
    >
      <option value="">All tactics</option>
      {TACTICS.map((tactic) => (
        <option key={tactic} value={tactic}>
          {tacticLabel(tactic)}
        </option>
      ))}
    </select>
  );
}
