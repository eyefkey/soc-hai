'use client';

import { useSyncExternalStore } from 'react';

/*
 * The wall clock is external mutable state, not something a component
 * derives, so it is read through a store rather than pushed into state
 * from an effect.
 *
 * One interval is shared by every subscriber and stops when the last one
 * unmounts, so a queue of fifty rows still ticks once a second.
 */
let tick = Date.now();
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);

  timer ??= setInterval(() => {
    tick = Date.now();
    listeners.forEach((listener) => listener());
  }, 1000);

  return () => {
    listeners.delete(onChange);

    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

/*
 * Null on the server and for the hydrating render, so markup produced on
 * the server matches what the client first renders; the real time arrives
 * on the tick after hydration.
 */
export function useNow(): number | null {
  return useSyncExternalStore(
    subscribe,
    () => tick,
    () => null,
  );
}
