import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void): () => void {
  if (typeof window.matchMedia !== 'function') return () => {};
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

const snapshot = (): boolean =>
  typeof window.matchMedia === 'function' && window.matchMedia(QUERY).matches;

/** `true` se l'utente ha chiesto di ridurre le animazioni (segue i cambi in tempo reale). */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}
