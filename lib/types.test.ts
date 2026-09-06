import { describe, expect, it } from 'vitest';

import {
  age,
  hasRole,
  incidentRef,
  nextSeverity,
  tacticLabel,
  type User,
} from './types';

function user(role: User['role']): User {
  return {
    id: 'u1',
    email: 'a@b.com',
    username: 'a',
    role,
    isActive: true,
    lastLoginAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('hasRole', () => {
  it('is false for a null user regardless of the required role', () => {
    expect(hasRole(null, 'VIEWER')).toBe(false);
  });

  it('lets a higher role satisfy a lower requirement', () => {
    expect(hasRole(user('ADMIN'), 'ANALYST')).toBe(true);
    expect(hasRole(user('ADMIN'), 'VIEWER')).toBe(true);
  });

  it('is true for an exact match', () => {
    expect(hasRole(user('ANALYST'), 'ANALYST')).toBe(true);
  });

  it('rejects a lower role than required', () => {
    expect(hasRole(user('VIEWER'), 'ANALYST')).toBe(false);
    expect(hasRole(user('ANALYST'), 'ADMIN')).toBe(false);
  });
});

describe('incidentRef', () => {
  it('pads the incident number to 4 digits with an INC- prefix', () => {
    expect(incidentRef(8)).toBe('INC-0008');
    expect(incidentRef(42)).toBe('INC-0042');
  });

  it('does not truncate a number already 4+ digits', () => {
    expect(incidentRef(12345)).toBe('INC-12345');
  });
});

describe('tacticLabel', () => {
  it('renders null as Unclassified', () => {
    expect(tacticLabel(null)).toBe('Unclassified');
  });

  it('title-cases a single-word tactic', () => {
    expect(tacticLabel('EXECUTION')).toBe('Execution');
  });

  it('splits underscores into separate title-cased words', () => {
    expect(tacticLabel('INITIAL_ACCESS')).toBe('Initial Access');
    expect(tacticLabel('COMMAND_AND_CONTROL')).toBe('Command And Control');
  });
});

describe('nextSeverity', () => {
  it('steps up one rung at a time', () => {
    expect(nextSeverity('LOW')).toBe('MEDIUM');
    expect(nextSeverity('MEDIUM')).toBe('HIGH');
    expect(nextSeverity('HIGH')).toBe('CRITICAL');
  });

  it('returns null at the top of the ladder', () => {
    expect(nextSeverity('CRITICAL')).toBeNull();
  });
});

describe('age', () => {
  it('formats elapsed time as HH:MM:SS', () => {
    const since = new Date('2026-01-01T00:00:00.000Z').toISOString();
    const now = new Date('2026-01-01T01:02:03.000Z').getTime();
    expect(age(since, now)).toBe('01:02:03');
  });

  it('floors negative elapsed time at zero instead of going negative', () => {
    const since = new Date('2026-01-01T01:00:00.000Z').toISOString();
    const now = new Date('2026-01-01T00:00:00.000Z').getTime();
    expect(age(since, now)).toBe('00:00:00');
  });
});
