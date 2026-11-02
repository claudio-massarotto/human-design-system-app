// Geocoding con Open-Meteo (https://open-meteo.com/en/docs/geocoding-api).
// PRIVACY: si invia soltanto il testo della città cercata (e la lingua), mai data o ora di nascita.
import type { Place } from '@hd/core';

export const GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search';
export const MIN_QUERY_LENGTH = 2;
export const RESULT_COUNT = 8;

/** Risultato del geocoding: un `Place` del motore più la regione amministrativa (solo display). */
export interface GeoPlace extends Place {
  admin1?: string;
}

export type GeocodingErrorKind = 'offline' | 'network' | 'http' | 'invalid';

export class GeocodingError extends Error {
  readonly kind: GeocodingErrorKind;
  constructor(kind: GeocodingErrorKind, message?: string) {
    super(message ?? kind);
    this.name = 'GeocodingError';
    this.kind = kind;
  }
}

export function normalizeQuery(query: string): string {
  return query.trim().replace(/\s+/g, ' ').slice(0, 100);
}

export function buildSearchUrl(
  query: string,
  language: 'it' | 'en',
  count: number = RESULT_COUNT,
): string {
  const params = new URLSearchParams({
    name: normalizeQuery(query),
    count: String(count),
    language,
    format: 'json',
  });
  return `${GEOCODING_ENDPOINT}?${params.toString()}`;
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null;
}

/** Converte la risposta JSON di Open-Meteo in luoghi; scarta le voci incomplete o incoerenti. */
export function mapGeocodingResponse(json: unknown): GeoPlace[] {
  if (!isRecord(json)) throw new GeocodingError('invalid');
  // Senza risultati Open-Meteo restituisce un oggetto senza il campo `results`.
  const results = json.results;
  if (results === undefined) return [];
  if (!Array.isArray(results)) throw new GeocodingError('invalid');
  const out: GeoPlace[] = [];
  const seen = new Set<string>();
  for (const r of results) {
    if (!isRecord(r)) continue;
    const { name, latitude, longitude, timezone, country, admin1 } = r;
    if (typeof name !== 'string' || !name.trim()) continue;
    if (typeof latitude !== 'number' || !Number.isFinite(latitude) || Math.abs(latitude) > 90)
      continue;
    if (typeof longitude !== 'number' || !Number.isFinite(longitude) || Math.abs(longitude) > 180)
      continue;
    if (typeof timezone !== 'string' || !timezone) continue;
    const key = `${latitude.toFixed(3)},${longitude.toFixed(3)},${name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      name: name.trim(),
      latitude,
      longitude,
      timezone,
      ...(typeof country === 'string' && country ? { country } : {}),
      ...(typeof admin1 === 'string' && admin1 ? { admin1 } : {}),
    });
  }
  return out;
}

export interface SearchOptions {
  language: 'it' | 'en';
  signal?: AbortSignal;
  fetchImpl?: typeof fetch;
}

export async function searchPlaces(query: string, opts: SearchOptions): Promise<GeoPlace[]> {
  const q = normalizeQuery(query);
  if (q.length < MIN_QUERY_LENGTH) return [];
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new GeocodingError('offline');
  }
  const doFetch = opts.fetchImpl ?? fetch;
  let res: Response;
  try {
    res = await doFetch(buildSearchUrl(q, opts.language), { signal: opts.signal });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e;
    throw new GeocodingError('network');
  }
  if (!res.ok) throw new GeocodingError('http', `HTTP ${res.status}`);
  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new GeocodingError('invalid');
  }
  return mapGeocodingResponse(json);
}

/** Rimuove i campi solo-display: ciò che si salva è un `Place` del motore. */
export function toPlace(g: GeoPlace): Place {
  return {
    name: g.name,
    latitude: g.latitude,
    longitude: g.longitude,
    timezone: g.timezone,
    ...(g.country ? { country: g.country } : {}),
  };
}

/** "Roma, Lazio, Italia" */
export function formatPlace(p: Place & { admin1?: string }): string {
  return [p.name, p.admin1, p.country].filter(Boolean).join(', ');
}

/** Fusi IANA disponibili nel browser (con fallback minimo). */
export function listTimezones(): string[] {
  let zones: string[] = [];
  try {
    zones = Intl.supportedValuesOf('timeZone');
  } catch {
    zones = [];
  }
  if (zones.length === 0) zones = ['Europe/Rome', 'Europe/London', 'America/New_York'];
  return zones.includes('UTC') ? zones : [...zones, 'UTC'];
}

export function guessTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}
