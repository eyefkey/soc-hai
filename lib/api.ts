import 'server-only';

import { getSessionToken } from './session';

/*
 * Server-side only. Every call to the SOC API goes through here so the
 * access token is attached on the server and never serialised into a
 * payload the browser can read.
 */
const API_URL = process.env.API_URL ?? 'http://localhost:4000';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type ApiRequest = {
  method?: string;
  body?: unknown;
  /*
   * Reads are not cached by default: an incident queue that shows stale
   * data is worse than one that costs an extra request.
   */
  cache?: RequestCache;
  signal?: AbortSignal;
};

export async function api<T>(
  path: string,
  { method = 'GET', body, cache = 'no-store', signal }: ApiRequest = {},
): Promise<T> {
  const token = await getSessionToken();

  const response = await fetch(`${API_URL}${path}`, {
    method,
    cache,
    signal,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const payload: unknown = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    throw new ApiError(response.status, messageFrom(payload), payload);
  }

  return payload as T;
}

/*
 * Nest returns `message` as either a string or an array of validation
 * failures; both are flattened to something a user can read.
 */
function messageFrom(payload: unknown): string {
  if (typeof payload !== 'object' || payload === null) {
    return 'Request failed';
  }

  const { message } = payload as { message?: unknown };

  if (Array.isArray(message)) {
    return message.join(', ');
  }

  return typeof message === 'string' ? message : 'Request failed';
}
