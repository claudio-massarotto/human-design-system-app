import { describe, expect, it } from 'vitest';
import { CENTER_GATES, WHEEL } from '../src/data/index';
import { longitudeToActivation } from '../src/mandala/activation';

describe('longitudeToActivation', () => {
  it('inizio della ruota: 302° = porta 41.1.1.1.1 sul confine', () => {
    const a = longitudeToActivation(302);
    expect([a.gate, a.line, a.color, a.tone, a.base]).toEqual([41, 1, 1, 1, 1]);
    expect(a.lineBoundaryArcsec).toBe(0);
  });

  it('tutte le 64 porte in ordine di ruota, a metà porta', () => {
    WHEEL.forEach((gate, i) => {
      const a = longitudeToActivation((302 + 5.625 * i + 5.625 / 2) % 360);
      expect(a.gate).toBe(gate);
      expect(a.line).toBe(4);
    });
  });

  it('subito prima di 302° è la porta 60, linea 6, base 5', () => {
    const a = longitudeToActivation(301.99999999);
    expect([a.gate, a.line, a.color, a.tone, a.base]).toEqual([60, 6, 6, 6, 5]);
  });

  it('gestisce longitudini negative e ≥ 360 come il floor-mod di Python', () => {
    const ref = longitudeToActivation(10);
    expect(longitudeToActivation(-350)).toMatchObject({
      gate: ref.gate,
      line: ref.line,
      color: ref.color,
      tone: ref.tone,
      base: ref.base,
    });
    expect(longitudeToActivation(370)).toMatchObject({ gate: ref.gate, line: ref.line });
    expect(longitudeToActivation(-58).gate).toBe(41);
    expect(longitudeToActivation(0).gate).toBe(25); // 0° Ariete = porta 25
  });

  it('lineBoundaryArcsec: distanza dal confine di linea più vicino', () => {
    // centro di una linea: 0.46875° = 1687.5" da entrambi i confini
    expect(longitudeToActivation(302 + 0.9375 / 2).lineBoundaryArcsec).toBeCloseTo(1687.5, 6);
    // 1" dopo il confine tra linea 1 e 2
    expect(longitudeToActivation(302 + 0.9375 + 1 / 3600).lineBoundaryArcsec).toBeCloseTo(1, 4);
    expect(longitudeToActivation(302 + 0.9375 - 2 / 3600).lineBoundaryArcsec).toBeCloseTo(2, 4);
  });

  it("suddivisioni nell'intervallo atteso e ogni porta appartiene a un centro", () => {
    const gates = new Set(Object.values(CENTER_GATES).flat());
    for (let l = 0; l < 360; l += 0.0371) {
      const a = longitudeToActivation(l);
      expect(gates.has(a.gate)).toBe(true);
      expect(a.line).toBeGreaterThanOrEqual(1);
      expect(a.line).toBeLessThanOrEqual(6);
      expect(a.color).toBeLessThanOrEqual(6);
      expect(a.tone).toBeLessThanOrEqual(6);
      expect(a.base).toBeGreaterThanOrEqual(1);
      expect(a.base).toBeLessThanOrEqual(5);
    }
  });

  it('rifiuta valori non finiti', () => {
    expect(() => longitudeToActivation(Number.NaN)).toThrow();
    expect(() => longitudeToActivation(Number.POSITIVE_INFINITY)).toThrow();
  });
});
