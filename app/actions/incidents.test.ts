import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock, MockApiError } = vi.hoisted(() => {
  class MockApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
      this.name = 'ApiError';
    }
  }

  return { apiMock: vi.fn(), MockApiError };
});

vi.mock('@/lib/api', () => ({
  api: (...args: unknown[]) => apiMock(...args),
  ApiError: MockApiError,
}));

const revalidatePath = vi.fn();
vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => revalidatePath(...args),
}));

const redirect = vi.fn();
vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => redirect(...args),
}));

// incidents.ts also imports lib/dal for assignToMe, which pulls in
// 'server-only' — unresolvable outside Next's own bundler, so it's
// stubbed out here rather than exercised (assignToMe isn't under test).
vi.mock('@/lib/dal', () => ({
  requireUser: vi.fn(),
}));

import { createIncident, escalateIncident } from './incidents';

function formData(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }
  return data;
}

describe('createIncident', () => {
  beforeEach(() => {
    apiMock.mockReset();
    revalidatePath.mockClear();
    redirect.mockClear();
  });

  it('rejects a missing title without calling the API', async () => {
    const result = await createIncident({}, formData({ severity: 'HIGH' }));

    expect(result).toEqual({ error: 'Title is required.' });
    expect(apiMock).not.toHaveBeenCalled();
  });

  it('rejects a missing severity without calling the API', async () => {
    const result = await createIncident({}, formData({ title: 'DDOS' }));

    expect(result).toEqual({ error: 'Severity is required.' });
    expect(apiMock).not.toHaveBeenCalled();
  });

  it('creates the incident, revalidates the queue and dashboard, and redirects to it', async () => {
    apiMock.mockResolvedValue({ id: 'inc-1' });

    await createIncident({}, formData({ title: 'DDOS', severity: 'CRITICAL' }));

    expect(apiMock).toHaveBeenCalledWith('/incidents', {
      method: 'POST',
      body: { title: 'DDOS', severity: 'CRITICAL' },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/incidents');
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    expect(redirect).toHaveBeenCalledWith('/incidents/inc-1');
  });

  it('surfaces a 403 from the API as a role-permission message', async () => {
    apiMock.mockRejectedValue(new MockApiError(403, 'Forbidden'));

    const result = await createIncident({}, formData({ title: 'DDOS', severity: 'HIGH' }));

    expect(result).toEqual({ error: 'Your role does not allow this action.' });
    expect(redirect).not.toHaveBeenCalled();
  });
});

describe('escalateIncident', () => {
  beforeEach(() => {
    apiMock.mockReset();
    revalidatePath.mockClear();
  });

  it('refuses to escalate past CRITICAL', async () => {
    apiMock.mockResolvedValueOnce({ id: 'inc-1', severity: 'CRITICAL' });

    const result = await escalateIncident('inc-1');

    expect(result).toEqual({ error: 'Already at the highest severity.' });
    // Only the read happened — no PATCH was sent.
    expect(apiMock).toHaveBeenCalledTimes(1);
  });

  it('bumps severity one rung and revalidates', async () => {
    apiMock.mockResolvedValueOnce({ id: 'inc-1', severity: 'HIGH' });
    apiMock.mockResolvedValueOnce({});

    const result = await escalateIncident('inc-1');

    expect(result).toEqual({});
    expect(apiMock).toHaveBeenNthCalledWith(2, '/incidents/inc-1', {
      method: 'PATCH',
      body: { severity: 'CRITICAL' },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/incidents/inc-1');
  });
});
