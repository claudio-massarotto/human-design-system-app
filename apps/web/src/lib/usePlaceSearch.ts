import { useEffect, useState } from 'react';
import {
  MIN_QUERY_LENGTH,
  GeocodingError,
  normalizeQuery,
  searchPlaces,
  type GeoPlace,
  type GeocodingErrorKind,
} from './geocoding';

export type PlaceSearchState =
  | { status: 'idle'; results: GeoPlace[] }
  | { status: 'loading'; results: GeoPlace[] }
  | { status: 'success'; results: GeoPlace[] }
  | { status: 'error'; results: GeoPlace[]; error: GeocodingErrorKind };

/** Ricerca città con debounce; annulla le richieste superate. */
export function usePlaceSearch(
  query: string,
  language: 'it' | 'en',
  debounceMs = 350,
): PlaceSearchState {
  const [state, setState] = useState<PlaceSearchState>({ status: 'idle', results: [] });
  const q = normalizeQuery(query);

  useEffect(() => {
    if (q.length < MIN_QUERY_LENGTH) {
      setState({ status: 'idle', results: [] });
      return;
    }
    const controller = new AbortController();
    setState((s) => ({ status: 'loading', results: s.results }));
    const timer = setTimeout(() => {
      searchPlaces(q, { language, signal: controller.signal }).then(
        (results) => setState({ status: 'success', results }),
        (e: unknown) => {
          if (controller.signal.aborted) return;
          const kind = e instanceof GeocodingError ? e.kind : 'network';
          setState({ status: 'error', results: [], error: kind });
        },
      );
    }, debounceMs);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q, language, debounceMs]);

  return state;
}
