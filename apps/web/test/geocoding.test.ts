import { describe, expect, it, vi } from 'vitest';
import {
  GeocodingError,
  buildSearchUrl,
  formatPlace,
  listTimezones,
  mapGeocodingResponse,
  normalizeQuery,
  searchPlaces,
  toPlace,
} from '../src/lib/geocoding';

const ROME = {
  id: 3169070,
  name: 'Roma',
  latitude: 41.89193,
  longitude: 12.51133,
  elevation: 20,
  feature_code: 'PPLC',
  country_code: 'IT',
  admin1: 'Lazio',
  timezone: 'Europe/Rome',
  population: 2318895,
  country: 'Italia',
};

describe('buildSearchUrl', () => {
  it('invia solo nome, lingua, conteggio e formato', () => {
    const url = new URL(buildSearchUrl('  New   York ', 'en'));
    expect(url.origin + url.pathname).toBe('https://geocoding-api.open-meteo.com/v1/search');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      name: 'New York',
      count: '8',
      language: 'en',
      format: 'json',
    });
  });
  it('normalizza spazi e lunghezza', () => {
    expect(normalizeQuery('  a   b  ')).toBe('a b');
    expect(normalizeQuery('x'.repeat(500))).toHaveLength(100);
  });
});

describe('mapGeocodingResponse', () => {
  it('mappa i risultati su Place con admin1 e fuso', () => {
    const [p] = mapGeocodingResponse({ results: [ROME] });
    expect(p).toEqual({
      name: 'Roma',
      latitude: 41.89193,
      longitude: 12.51133,
      timezone: 'Europe/Rome',
      country: 'Italia',
      admin1: 'Lazio',
    });
    expect(toPlace(p!)).toEqual({
      name: 'Roma',
      latitude: 41.89193,
      longitude: 12.51133,
      timezone: 'Europe/Rome',
      country: 'Italia',
    });
    expect(formatPlace(p!)).toBe('Roma, Lazio, Italia');
  });

  it('senza `results` restituisce un elenco vuoto', () => {
    expect(mapGeocodingResponse({ generationtime_ms: 0.4 })).toEqual([]);
  });

  it('scarta voci incomplete, fuori scala o duplicate', () => {
    const res = mapGeocodingResponse({
      results: [
        ROME,
        { ...ROME }, // duplicato
        { ...ROME, name: 'Senza fuso', timezone: undefined },
        { ...ROME, name: 'Lat folle', latitude: 120 },
        { ...ROME, name: 'Lon NaN', longitude: 'x' },
        { ...ROME, name: '  ' },
        null,
        'testo',
      ],
    });
    expect(res.map((r) => r.name)).toEqual(['Roma']);
  });

  it('rifiuta risposte malformate', () => {
    expect(() => mapGeocodingResponse(null)).toThrow(GeocodingError);
    expect(() => mapGeocodingResponse({ results: 'no' })).toThrow(GeocodingError);
  });
});

describe('searchPlaces', () => {
  const ok = (body: unknown) =>
    vi.fn(
      async () => new Response(JSON.stringify(body), { status: 200 }),
    ) as unknown as typeof fetch;

  it('non interroga la rete per query troppo corte', async () => {
    const fetchImpl = ok({ results: [ROME] });
    expect(await searchPlaces('R', { language: 'it', fetchImpl })).toEqual([]);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('chiama Open-Meteo e mappa il risultato', async () => {
    const fetchImpl = ok({ results: [ROME] });
    const res = await searchPlaces('Roma', { language: 'it', fetchImpl });
    expect(res[0]?.timezone).toBe('Europe/Rome');
    const calledUrl = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock
      .calls[0]![0] as string;
    expect(calledUrl).toContain('name=Roma');
    expect(calledUrl).toContain('language=it');
  });

  it('classifica gli errori: http, rete, risposta non valida', async () => {
    const http = vi.fn(async () => new Response('', { status: 500 })) as unknown as typeof fetch;
    await expect(searchPlaces('Roma', { language: 'it', fetchImpl: http })).rejects.toMatchObject({
      kind: 'http',
    });

    const net = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    }) as unknown as typeof fetch;
    await expect(searchPlaces('Roma', { language: 'it', fetchImpl: net })).rejects.toMatchObject({
      kind: 'network',
    });

    const bad = vi.fn(
      async () => new Response('<html>', { status: 200 }),
    ) as unknown as typeof fetch;
    await expect(searchPlaces('Roma', { language: 'it', fetchImpl: bad })).rejects.toMatchObject({
      kind: 'invalid',
    });
  });

  it('segnala offline senza fare richieste', async () => {
    const spy = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    const fetchImpl = ok({ results: [ROME] });
    await expect(searchPlaces('Roma', { language: 'it', fetchImpl })).rejects.toMatchObject({
      kind: 'offline',
    });
    expect(fetchImpl).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('propaga AbortError', async () => {
    const aborted = vi.fn(async () => {
      throw new DOMException('abort', 'AbortError');
    }) as unknown as typeof fetch;
    await expect(
      searchPlaces('Roma', { language: 'it', fetchImpl: aborted }),
    ).rejects.toMatchObject({
      name: 'AbortError',
    });
  });
});

describe('listTimezones', () => {
  it('include fusi IANA noti e UTC', () => {
    const zones = listTimezones();
    expect(zones).toContain('Europe/Rome');
    expect(zones).toContain('UTC');
  });
});
