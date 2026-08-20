export type UserRole = 'VIEWER' | 'ANALYST' | 'ADMIN';

export type User = {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

export type LoginResponse = {
  accessToken: string;
  user: User;
};

export type Paginated<T> = {
  data: T[];
  meta: {
    total: number;
    skip: number;
    take: number;
  };
};

/*
 * Mirrors the backend ranking: a higher role satisfies any lower one.
 */
const RANK: Record<UserRole, number> = {
  VIEWER: 0,
  ANALYST: 1,
  ADMIN: 2,
};

export function hasRole(user: User | null, minimum: UserRole): boolean {
  return user ? RANK[user.role] >= RANK[minimum] : false;
}

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IncidentStatus =
  | 'OPEN'
  | 'INVESTIGATING'
  | 'CONTAINED'
  | 'RESOLVED'
  | 'CLOSED';

export type MitreTactic =
  | 'RECONNAISSANCE'
  | 'RESOURCE_DEVELOPMENT'
  | 'INITIAL_ACCESS'
  | 'EXECUTION'
  | 'PERSISTENCE'
  | 'PRIVILEGE_ESCALATION'
  | 'DEFENSE_EVASION'
  | 'CREDENTIAL_ACCESS'
  | 'DISCOVERY'
  | 'LATERAL_MOVEMENT'
  | 'COLLECTION'
  | 'COMMAND_AND_CONTROL'
  | 'EXFILTRATION'
  | 'IMPACT';

export type Asset = {
  id: string;
  name: string;
  hostname: string | null;
  ipAddress: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'COMPROMISED' | 'QUARANTINED' | 'DECOMMISSIONED';
};

export type Incident = {
  id: string;
  number: number;
  title: string;
  description: string | null;
  severity: Severity;
  status: IncidentStatus;
  tactic: MitreTactic | null;
  createdAt: string;
  updatedAt: string;
  assets?: { asset: Asset }[];
  investigation?: {
    id: string;
    status: string;
    assignedTo: string | null;
  } | null;
};

export type ActivityBucket = {
  at: string;
  CRITICAL: number;
  HIGH: number;
  MEDIUM: number;
  LOW: number;
};

export type StatsOverview = {
  incidents: {
    open: number;
    bySeverity: Record<Severity, number>;
  };
  assets: {
    active: number;
    compromised: number;
    quarantined: number;
  };
  indicators: { total: number };
  investigations: { open: number; unassigned: number };
  activity: { windowMinutes: number; series: ActivityBucket[] };
  tactics: { tactic: MitreTactic; count: number }[];
};

/*
 * Analysts say "INC-0042" out loud; the cuid is only ever a URL segment.
 */
export function incidentRef(number: number): string {
  return `INC-${String(number).padStart(4, '0')}`;
}

export function tacticLabel(tactic: MitreTactic | null): string {
  if (!tactic) {
    return 'Unclassified';
  }

  return tactic
    .toLowerCase()
    .split('_')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

/*
 * Elapsed time as HH:MM:SS, matching how a queue ages a row.
 */
export function age(since: string, now: number = Date.now()): string {
  const seconds = Math.max(0, Math.floor((now - new Date(since).getTime()) / 1000));

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [hours, minutes, secs].map((n) => String(n).padStart(2, '0')).join(':');
}
