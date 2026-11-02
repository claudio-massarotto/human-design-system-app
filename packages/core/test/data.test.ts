import { describe, expect, it } from 'vitest';
import {
  CENTER_GATES,
  CHANNELS,
  CIRCUIT_GROUP,
  CROSS_TABLE,
  GATE_CENTER,
  GATE_QUARTER,
  WHEEL,
} from '../src/data/index';

describe('dati strutturali', () => {
  it('la ruota contiene le 64 porte una sola volta', () => {
    expect(new Set(WHEEL).size).toBe(64);
    expect([...WHEEL].sort((a, b) => a - b)).toEqual(Array.from({ length: 64 }, (_, i) => i + 1));
  });

  it('ogni porta appartiene a esattamente un centro e a un quarto', () => {
    const all = Object.values(CENTER_GATES).flat();
    expect(all).toHaveLength(64);
    for (let g = 1; g <= 64; g++) {
      expect(GATE_CENTER[g]).toBeDefined();
      expect(GATE_QUARTER[g]).toBeDefined();
    }
  });

  it('36 canali tra centri diversi, con id canonici unici', () => {
    expect(CHANNELS).toHaveLength(36);
    expect(new Set(CHANNELS.map((c) => c.id)).size).toBe(36);
    for (const c of CHANNELS) {
      expect(c.gates[0]).toBeLessThan(c.gates[1]);
      expect(c.centers[0]).not.toBe(c.centers[1]);
    }
  });

  it('distribuzione dei circuiti: 9 Knowing, 2 Centering, 4 Integrazione, 7+7 Collettivi, 5 Ego, 2 Difesa', () => {
    const count = (id: string) => CHANNELS.filter((c) => c.circuit === id).length;
    expect(count('individualKnowing')).toBe(9);
    expect(count('individualCentering')).toBe(2);
    expect(count('integration')).toBe(4);
    expect(count('collectiveLogic')).toBe(7);
    expect(count('collectiveAbstract')).toBe(7);
    expect(count('tribalEgo')).toBe(5);
    expect(count('tribalDefense')).toBe(2);
    expect(Object.keys(CIRCUIT_GROUP)).toHaveLength(7);
  });

  it('la tabella delle croci copre tutte le 64 porte', () => {
    expect(Object.keys(CROSS_TABLE)).toHaveLength(64);
  });
});
