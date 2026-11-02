import { beforeAll, describe, expect, it } from 'vitest';
import type { Engine } from '../src/types';
import { compareWithOracle, golden } from './oracle';
import { getEngine } from './helpers';

describe('golden test vs hd_ref.py (Swiss Ephemeris)', () => {
  let engine: Engine;
  beforeAll(async () => {
    engine = await getEngine();
  });

  it('il fixture contiene 300 casi con nodo vero e 40 con nodo medio', () => {
    expect(golden.cases.filter((c) => c.node === 'true')).toHaveLength(300);
    expect(golden.cases.filter((c) => c.node === 'mean')).toHaveLength(40);
  });

  for (const node of ['true', 'mean'] as const) {
    it(`identità al 100% su 26 attivazioni e derivazioni (nodo ${node})`, () => {
      const all = { diffs: [] as string[], boundary: [] as string[], maxLonDiff: 0, n: 0 };
      for (const g of golden.cases.filter((c) => c.node === node)) {
        const chart = engine.computeChartFromUtc(new Date(g.utc), { node });
        const r = compareWithOracle(engine, chart, g);
        all.diffs.push(...r.diffs);
        all.boundary.push(...r.boundary);
        all.maxLonDiff = Math.max(all.maxLonDiff, r.maxLonDiff);
        all.n++;
      }
      expect(all.diffs).toEqual([]);
      // Unici scarti ammessi: flip di base del Nodo vero (e Sud) a < 5e-5° da un confine (vedi sopra).
      for (const line of all.boundary) expect(line).toMatch(/[nN]orthNode|southNode/);
      expect(all.boundary.length).toBeLessThanOrEqual(node === 'true' ? 4 : 0);
      console.info(
        `[golden ${node}] ${all.n} casi, max |Δlon| = ${all.maxLonDiff.toExponential(2)}°, flip spiegati da confine: ${all.boundary.length}`,
      );
    });
  }
});
