'use client';

import { useRouter } from 'next/navigation';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { tacticLabel, type MitreTactic } from '@/lib/types';

/*
 * Radix's Select rejects an empty-string item value (it's reserved to mean
 * "no selection"), so "All tactics" needs its own sentinel that onChange
 * translates back into "delete the tactic param" below.
 */
const ALL = 'all';

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

    if (value !== ALL) {
      params.set('tactic', value);
    } else {
      params.delete('tactic');
    }

    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  };

  return (
    <Select value={active ?? ALL} onValueChange={onChange}>
      <SelectTrigger
        size="sm"
        className="h-7 px-2 text-[10px] font-semibold tracking-[0.08em] uppercase"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>All tactics</SelectItem>
        {TACTICS.map((tactic) => (
          <SelectItem key={tactic} value={tactic}>
            {tacticLabel(tactic)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
