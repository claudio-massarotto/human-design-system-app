import { describe, expect, it } from 'vitest';
import { computePenta } from '../src/penta';
import type { Gate } from '../src/types';

const chart = (...gates: Gate[]) => ({ gates: gates.map((gate) => ({ gate, personality: [], design: [] })) });

describe('computePenta', () => {
  it('unisce le porte dei membri e copre canali anche tra chart diversi', () => {
    const result = computePenta([chart(5, 8), chart(15, 1), chart(31, 7)]);
    expect(result.withinPentaRange).toBe(true);
    expect(result.gates.find(({ gate }) => gate === 5)?.members).toEqual(['0']);
    expect(result.channels.find(({ id }) => id === '15-5')?.covered).toBe(true);
    expect(result.channels.find(({ id }) => id === '1-8')?.covered).toBe(true);
  });

  it('segnala vuoti e stabilisce la fascia da 3 a 5 chart', () => {
    const result = computePenta([chart(1), chart(8)]);
    expect(result.withinPentaRange).toBe(false);
    expect(result.gates.find(({ gate }) => gate === 13)?.members).toEqual([]);
    expect(result.channels).toHaveLength(6);
  });
});
