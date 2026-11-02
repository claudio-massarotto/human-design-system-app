import { describe, expect, it } from 'vitest';
import {
  SwissEphemerisProvider,
  createEngine,
  longitudeToActivation,
  toUtc,
  WHEEL,
  CROSS_TABLE,
} from '../src/index';
import type { EphemerisProvider } from '../src/index';
import { birth, getEngine } from './helpers';

describe('SwissEphemerisProvider', () => {
  it('Julian Day: epoca Unix e J2000', async () => {
    const p = await SwissEphemerisProvider.create();
    expect(p.id).toBe('swisseph-wasm-moshier');
    expect(p.julianDay(new Date('1970-01-01T00:00:00Z'))).toBe(2440587.5);
    expect(p.julianDay(new Date('2000-01-01T12:00:00Z'))).toBe(2451545);
    expect(p.julianDay(new Date('2026-11-02T18:00:00Z'))).toBe(2461347.25);
  });

  it("fromJulianDay è l'inverso di julianDay (entro 1 ms)", async () => {
    const p = await SwissEphemerisProvider.create();
    for (const iso of [
      '1879-03-14T10:50:02.000Z',
      '1948-04-09T05:05:00.000Z',
      '2026-11-02T12:34:56.789Z',
    ]) {
      const d = new Date(iso);
      expect(Math.abs(p.fromJulianDay(p.julianDay(d)).getTime() - d.getTime())).toBeLessThanOrEqual(
        1,
      );
    }
  });

  it('posizioni note: Sole a J2000 ≈ 280.37°, velocità ≈ 1°/giorno; nodo vero ≠ medio', async () => {
    const p = await SwissEphemerisProvider.create();
    const sun = p.position(2451545, 'sun', 'true');
    expect(sun.longitude).toBeCloseTo(280.37, 1);
    expect(sun.speed).toBeCloseTo(1.019, 2);
    const t = p.position(2451545, 'northNode', 'true');
    const m = p.position(2451545, 'northNode', 'mean');
    expect(m.longitude).toBeCloseTo(125.04, 1); // nodo medio a J2000
    expect(t.longitude).not.toBe(m.longitude);
  });

  it('init è idempotente e concorrente', async () => {
    const p = new SwissEphemerisProvider();
    expect(p.isReady).toBe(false);
    await Promise.all([p.init(), p.init()]);
    expect(p.isReady).toBe(true);
    await p.init();
  });

  it('data non valida → errore', async () => {
    const p = await SwissEphemerisProvider.create();
    expect(() => p.julianDay(new Date('nope'))).toThrow();
  });
});

describe('createEngine', () => {
  it('senza provider ne crea uno; accetta provider non inizializzato e provider personalizzati', async () => {
    const e1 = await createEngine();
    expect(e1.provider.id).toBe('swisseph-wasm-moshier');

    const raw = new SwissEphemerisProvider();
    const e2 = await createEngine(raw);
    expect(raw.isReady).toBe(true);
    expect(e2.provider).toBe(raw);

    // provider "decoratore" che conta le chiamate
    let calls = 0;
    const wrapped: EphemerisProvider = {
      id: 'counting',
      julianDay: (d) => raw.julianDay(d),
      fromJulianDay: (j) => raw.fromJulianDay(j),
      position: (...args) => (calls++, raw.position(...args)),
    };
    const e3 = await createEngine(wrapped);
    const c = e3.computeChartFromUtc(new Date('2000-01-01T12:00:00Z'));
    expect(calls).toBeGreaterThan(22);
    expect(c.personality.sun.longitude).toBeCloseTo(280.37, 1);
  });

  it('computeChart: input e avvisi nel chart, stesso risultato di computeChartFromUtc', async () => {
    const e = await getEngine();
    const input = birth('2023-10-29', '02:30', 'Europe/Rome');
    const c = e.computeChart(input);
    expect(c.input).toEqual(input);
    expect(c.timeWarnings.map((w) => w.code)).toEqual(['ambiguousLocalTime']);
    expect(c.utc).toBe('2023-10-29T00:30:00.000Z');
    const direct = e.computeChartFromUtc(new Date(c.utc));
    expect({ ...direct, input: c.input, timeWarnings: c.timeWarnings }).toEqual(c);
  });

  it('computeChart con nodo medio e ora sconosciuta', async () => {
    const e = await getEngine();
    const c = e.computeChart(birth('2000-05-05', null, 'Europe/Rome', 'unknown'), { node: 'mean' });
    expect(c.options.node).toBe('mean');
    expect(c.timeWarnings.map((w) => w.code)).toEqual(['timeUnknown']);
    expect(c.utc).toBe('2000-05-05T10:00:00.000Z');
  });

  it('API pubblica esportata da index', () => {
    expect(typeof toUtc).toBe('function');
    expect(typeof longitudeToActivation).toBe('function');
    expect(WHEEL).toHaveLength(64);
    expect(Object.keys(CROSS_TABLE)).toHaveLength(64);
  });

  it('performance: computeChart', async () => {
    const e = await getEngine();
    const input = birth('1985-10-08', '22:35', 'Europe/Rome');
    for (let i = 0; i < 20; i++) e.computeChart(input);
    const n = 500;
    const t0 = performance.now();
    for (let i = 0; i < n; i++) e.computeChart(input);
    const ms = (performance.now() - t0) / n;
    console.info(`[perf] computeChart = ${ms.toFixed(2)} ms`);
    expect(ms).toBeLessThan(20);
  });
});
