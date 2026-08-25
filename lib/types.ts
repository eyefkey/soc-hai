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

export type AssetType =
  | 'SERVER'
  | 'DATABASE'
  | 'API'
  | 'ENDPOINT'
  | 'NETWORK_DEVICE'
  | 'CLOUD'
  | 'OTHER';

export type AssetStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'COMPROMISED'
  | 'QUARANTINED'
  | 'DECOMMISSIONED';

export type Asset = {
  id: string;
  name: string;
  type: AssetType;
  hostname: string | null;
  ipAddress: string | null;
  status: AssetStatus;
  description?: string | null;
  monitoredUrl?: string | null;
  checkThreshold?: number | null;
  checkSeverity?: Severity | null;
  createdAt?: string;
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

export type Alert = {
  id: string;
  title: string;
  description: string | null;
  severity: Severity;
  source: string | null;
  sourceIp: string | null;
  targetIp: string | null;
  tactic: MitreTactic | null;
  affectedUser: string | null;
  createdAt: string;
  incidentId: string | null;
};

export type EvidenceType =
  | 'IP_ADDRESS'
  | 'DOMAIN'
  | 'URL'
  | 'FILE_HASH'
  | 'LOG'
  | 'SCREENSHOT'
  | 'FILE'
  | 'OTHER';

export type Evidence = {
  id: string;
  type: EvidenceType;
  value: string;
  description: string | null;
  createdAt: string;
};

export type Investigation = {
  id: string;
  incidentId: string;
  status: 'OPEN' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED' | 'CLOSED';
  assignedTo: string | null;
  startedAt: string;
  completedAt: string | null;
  conclusion: string | null;
};

export type IncidentDetail = Incident & {
  alerts: Alert[];
  evidence: Evidence[];
  investigation: Investigation | null;
};

export type InvestigationEvent = {
  id: string;
  timestamp: string;
  type: 'INCIDENT' | 'ALERT' | 'EVIDENCE' | 'ASSET' | 'AUDIT';
  action: string;
  sourceId: string;
  description: string;
  severity?: Severity;
  metadata?: Record<string, unknown>;
};

export type RiskFactor = {
  name: string;
  points: number;
  reason: string;
};

export type RiskScore = {
  investigationId: string;
  score: number;
  level: Severity;
  factors: RiskFactor[];
};

export type Correlation = {
  type:
    | 'ALERT_ASSET'
    | 'ALERT_EVIDENCE'
    | 'EVIDENCE_ASSET'
    | 'INVESTIGATION_FINDING';
  sourceId: string;
  targetId: string;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  reason: string;
};

export type CorrelationResult = {
  investigationId: string;
  incidentId: string;
  risk: RiskScore;
  correlations: Correlation[];
};

export type Explanation = {
  investigationId: string;
  risk: { score: number; level: Severity };
  explanation: { summary: string; factors: string[] };
};

export type Finding = {
  id: string;
  title: string;
  description: string;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  impact: string | null;
  recommendation: string | null;
  createdAt: string;
};

/*
 * The next severity up, for escalation. CRITICAL has nowhere to go.
 */
export function nextSeverity(severity: Severity): Severity | null {
  const ladder: Severity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  return ladder[ladder.indexOf(severity) + 1] ?? null;
}

export type AuditAction =
  | 'CREATED'
  | 'UPDATED'
  | 'DELETED'
  | 'ATTACHED'
  | 'DETACHED'
  | 'VIEWED'
  | 'UPLOADED'
  | 'DOWNLOADED'
  | 'STATUS_CHANGED';

export type AuditEntity = 'INCIDENT' | 'ALERT' | 'ASSET' | 'EVIDENCE' | 'USER' | 'INVESTIGATION' | 'FINDING';

export type AuditLogEntry = {
  id: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId: string | null;
  userId: string | null;
  username: string | null;
  description: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};
