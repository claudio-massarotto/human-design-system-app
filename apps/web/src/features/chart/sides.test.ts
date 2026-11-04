import { beforeAll, describe, expect, it } from 'vitest';
import { CHANNEL_BY_ID, CENTERS, type Chart } from '@hd/core';
import { MILANO, ROMA, getTestEngine } from '../today/testUtils';
import { sideDefinition, splitSides } from './sides';

let charts: Chart[];

beforeAll(async () => {
  const engine = await getTestEngine();
  charts = [ROMA, MILANO].map((b) => engine.computeChart(b));
});

describe('splitSides', () => {
  it('canali dei due lati più canali ponte = canali del chart', () => {
    for (const chart of charts) {
      const s = splitSides(chart);
      const all = new Set([...s.personality.channels, ...s.design.channels, ...s.bridges]);
      expect([...all].sort()).toEqual([...chart.channels].sort());
    }
  });

  it('un canale ponte ha una porta solo conscia e una solo inconscia', () => {
    for (const chart of charts) {
      const s = splitSides(chart);
      const p = new Set(s.personality.gates);
      const d = new Set(s.design.gates);
      for (const id of s.bridges) {
        const [a, b] = CHANNEL_BY_ID[id]!.gates;
        expect((p.has(a) && d.has(b)) || (p.has(b) && d.has(a))).toBe(true);
        expect(s.personality.channels).not.toContain(id);
        expect(s.design.channels).not.toContain(id);
      }
    }
  });

  it('i centri di un lato sono definiti anche nel chart intero', () => {
    for (const chart of charts) {
      const s = splitSides(chart);
      for (const side of [s.personality, s.design]) {
        for (const c of side.centers) expect(chart.centers[c]).toBe('defined');
      }
      for (const c of s.bridgeCenters) {
        expect(chart.centers[c]).toBe('defined');
        expect(s.personality.centers).not.toContain(c);
        expect(s.design.centers).not.toContain(c);
      }
      // ogni centro definito è spiegato da un lato o dall'unione
      const explained = new Set([
        ...s.personality.centers,
        ...s.design.centers,
        ...s.bridgeCenters,
      ]);
      for (const c of CENTERS) {
        if (chart.centers[c] === 'defined') expect(explained.has(c)).toBe(true);
      }
    }
  });

  it('le porte di un lato sono quelle dei suoi 13 corpi', () => {
    const chart = charts[0]!;
    const def = sideDefinition(chart, 'personality');
    expect(def.gates).toContain(chart.personality.sun.gate);
    expect(def.gates).toContain(chart.personality.earth.gate);
    expect(def.gates.length).toBeLessThanOrEqual(13);
    expect([...def.gates]).toEqual([...def.gates].sort((a, b) => a - b));
  });
});
