import { beforeAll, describe, expect, it } from 'vitest';
import { WHEEL, WHEEL_START, GATE_WIDTH, type Engine, type Gate, type Transit } from '@hd/core';
import { nextSunIngresses, type TransitFn } from './sunCalendar';
import { getTestEngine } from './testUtils';

const DAY = 86_400_000;

/** Transito finto: il Sole avanza di 1°/giorno da una longitudine nota. */
function fakeCompute(startLongitude: number, epoch: number): TransitFn {
  return (at) => {
    const lon = (((startLongitude + ((at.getTime() - epoch) / DAY) * 1) % 360) + 360) % 360;
    const idx = Math.floor(((((lon - WHEEL_START) % 360) + 360) % 360) / GATE_WIDTH);
    const gate = WHEEL[idx] as Gate;
    return { activations: { sun: { gate } } } as unknown as Transit;
  };
}

describe('nextSunIngresses (dati finti)', () => {
  const epoch = Date.UTC(2026, 0, 1);
  // Inizio della porta 41 + 2° → mancano 3,625° al prossimo ingresso (porta 19).
  const compute = fakeCompute(WHEEL_START + 2, epoch);

  it('restituisce 4 ingressi in ordine, nella porta successiva della ruota', () => {
    const out = nextSunIngresses(compute, new Date(epoch), 4, { precisionMs: 1000 });
    expect(out).toHaveLength(4);
    expect(out.map((i) => i.gate)).toEqual([19, 13, 49, 30]);
    expect(out.map((i) => i.fromGate)).toEqual([41, 19, 13, 49]);
    for (let i = 1; i < out.length; i++) expect(out[i]!.at > out[i - 1]!.at).toBe(true);
  });

  it("affina l'istante di ingresso alla precisione richiesta", () => {
    const [first] = nextSunIngresses(compute, new Date(epoch), 1, { precisionMs: 1000 });
    const expected = epoch + 3.625 * DAY;
    expect(Math.abs(first!.at.getTime() - expected)).toBeLessThan(2000);
    // l'istante riportato appartiene già alla nuova porta, un secondo prima no
    expect(compute(first!.at).activations.sun.gate).toBe(19);
    expect(compute(new Date(first!.at.getTime() - 2000)).activations.sun.gate).toBe(41);
  });

  it('rispetta il limite di giorni di ricerca', () => {
    expect(nextSunIngresses(compute, new Date(epoch), 4, { maxDays: 3 })).toEqual([]);
  });
});

describe('nextSunIngresses (motore reale)', () => {
  let engine: Engine;
  beforeAll(async () => {
    engine = await getTestEngine();
  });

  it('trova quattro ingressi plausibili (~5,7 giorni ciascuno) con linea 1', () => {
    const from = new Date(Date.UTC(2026, 10, 2, 12, 0));
    const compute: TransitFn = (d) => engine.computeTransit(d);
    const out = nextSunIngresses(compute, from, 4);
    expect(out).toHaveLength(4);
    let prev = from.getTime();
    for (const ingress of out) {
      const days = (ingress.at.getTime() - prev) / DAY;
      expect(days).toBeGreaterThan(0);
      expect(days).toBeLessThan(6.5);
      prev = ingress.at.getTime();
      const sun = compute(ingress.at).activations.sun;
      expect(sun.gate).toBe(ingress.gate);
      expect(sun.line).toBe(1);
      const before = compute(new Date(ingress.at.getTime() - 61_000)).activations.sun;
      expect(before.gate).toBe(ingress.fromGate);
    }
    // 4 ingressi ≈ 4 × 5,7 giorni
    expect((prev - from.getTime()) / DAY).toBeLessThan(26);
  });
});
