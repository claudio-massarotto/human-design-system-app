import { beforeAll, describe, expect, it } from 'vitest';
import { toUtc } from '../src/time/utc';
import type { BirthInput, Chart, Engine, Sensitivity } from '../src/types';
import { birth, getEngine } from './helpers';

const atOffset = (engine: Engine, input: BirthInput, minutes: number): Chart =>
  engine.computeChartFromUtc(new Date(toUtc(input).utc.getTime() + minutes * 60_000));

describe('timeSensitivity', () => {
  let engine: Engine;
  beforeAll(async () => {
    engine = await getEngine();
  });

  it("stabile: nessun elemento di sintesi cambia nell'intervallo (eventi minori possibili, es. Luna del Design)", () => {
    const input = birth('1990-06-15', '10:00', 'Europe/Rome');
    const s = engine.timeSensitivity(input, 30);
    expect(s.rangeMinutes).toBe(30);
    expect(s.stable).toBe(true);
    expect(s.events.length).toBeGreaterThan(0); // la Luna cambia linea, ma non la sintesi
    for (const e of s.events) expect(e.affects).toEqual([]);
    // verifica indipendente: in ogni minuto dell'intervallo la sintesi è identica
    const base = atOffset(engine, input, 0);
    for (let m = -30; m <= 30; m++) {
      const c = atOffset(engine, input, m);
      expect([c.type, c.authority, c.profile.id, c.definition, c.cross.name, c.channels]).toEqual([
        base.type,
        base.authority,
        base.profile.id,
        base.definition,
        base.cross.name,
        base.channels,
      ]);
    }
  });

  it('range 0: stabile e senza eventi', () => {
    const s = engine.timeSensitivity(birth('1990-06-15', '10:00', 'Europe/Rome'), 0);
    expect(s).toEqual({ rangeMinutes: 0, stable: true, events: [] });
  });

  it('instabile: cambia il tipo/autorità/canali, eventi coerenti con i chart a ±1 minuto', () => {
    const input = birth('1990-06-15', '07:20', 'Europe/Rome');
    const s = engine.timeSensitivity(input, 30);
    expect(s.stable).toBe(false);
    const withEffect = s.events.filter((e) => e.affects.length > 0);
    expect(withEffect.length).toBeGreaterThan(0);
    const base = atOffset(engine, input, 0);
    for (const e of s.events) {
      expect(e.offsetMinutes).toBeGreaterThanOrEqual(-30);
      expect(e.offsetMinutes).toBeLessThanOrEqual(30);
      expect(e.offsetMinutes).not.toBe(-30 - 1);
      expect(e.from).not.toEqual(e.to);
      expect(['personality', 'design']).toContain(e.side);
      // from = situazione al minuto precedente, to = al minuto dell'evento
      const before = atOffset(engine, input, e.offsetMinutes - 1)[e.side][e.body];
      const after = atOffset(engine, input, e.offsetMinutes)[e.side][e.body];
      expect(e.from).toEqual({ gate: before.gate, line: before.line });
      expect(e.to).toEqual({ gate: after.gate, line: after.line });
      // affects = campi che differiscono dal chart dichiarato nello stato "esterno" dell'evento
      const c = atOffset(
        engine,
        input,
        e.offsetMinutes <= 0 ? e.offsetMinutes - 1 : e.offsetMinutes,
      );
      const diffs = [
        c.type !== base.type && 'type',
        c.authority !== base.authority && 'authority',
        c.profile.id !== base.profile.id && 'profile',
        c.definition !== base.definition && 'definition',
        c.cross.name !== base.cross.name && 'cross',
        c.channels.join() !== base.channels.join() && 'channels',
      ].filter(Boolean);
      expect(e.affects).toEqual(diffs);
    }
    // gli eventi sono ordinati per offset
    const offsets = s.events.map((e) => e.offsetMinutes);
    expect(offsets).toEqual([...offsets].sort((a, b) => a - b));
  });

  it('un cambio di linea del Sole modifica il profilo', () => {
    const input = birth('1990-06-15', '00:00', 'Europe/Rome');
    const s = engine.timeSensitivity(input, 30);
    expect(s.stable).toBe(false);
    const sunEvent = s.events.find((e) => e.body === 'sun' && e.affects.includes('profile'));
    expect(sunEvent).toBeDefined();
    expect(sunEvent!.from.line).not.toBe(sunEvent!.to.line);
  });

  it('un intervallo più ampio include gli eventi di uno più stretto', () => {
    const input = birth('1990-06-15', '07:20', 'Europe/Rome');
    const small: Sensitivity = engine.timeSensitivity(input, 20);
    const big: Sensitivity = engine.timeSensitivity(input, 60);
    const key = (e: Sensitivity['events'][number]) =>
      `${e.offsetMinutes}|${e.side}|${e.body}|${e.from.gate}.${e.from.line}>${e.to.gate}.${e.to.line}`;
    const bigKeys = new Set(big.events.map(key));
    for (const e of small.events) expect(bigKeys.has(key(e))).toBe(true);
  });

  it('range 120 in meno di 1,5 secondi', () => {
    const input = birth('1990-06-15', '07:20', 'Europe/Rome');
    engine.timeSensitivity(input, 5); // warm-up
    const t0 = performance.now();
    const s = engine.timeSensitivity(input, 120);
    const ms = performance.now() - t0;
    console.info(`[perf] timeSensitivity(±120) = ${ms.toFixed(0)} ms, ${s.events.length} eventi`);
    expect(ms).toBeLessThan(1500);
    expect(s.events.length).toBeGreaterThan(0);
  });
});
