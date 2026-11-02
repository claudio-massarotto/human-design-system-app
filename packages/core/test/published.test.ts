import { beforeAll, describe, expect, it } from 'vitest';
import type { Engine, ProfileId } from '../src/types';
import { compareWithOracle, golden } from './oracle';
import { birth, getEngine } from './helpers';

// Valori pubblicati (docs/knowledge/14-chart-di-riferimento-per-test.md) per i 10 chart di riferimento.
const PUBLISHED: Record<
  string,
  {
    type: string;
    profile: ProfileId;
    authority: string;
    definition: string;
    cross: number[];
    slug: string;
  }
> = {
  'Ra Uru Hu': {
    type: 'manifestor',
    profile: '5/1',
    authority: 'splenic',
    definition: 'single',
    cross: [51, 57, 61, 62],
    slug: 'lax-clarion',
  },
  Obama: {
    type: 'projector',
    profile: '6/2',
    authority: 'emotional',
    definition: 'single',
    cross: [33, 19, 2, 1],
    slug: 'lax-refinement',
  },
  Einstein: {
    type: 'generator',
    profile: '1/4',
    authority: 'emotional',
    definition: 'split',
    cross: [36, 6, 11, 12],
    slug: 'rax-eden',
  },
  Jobs: {
    type: 'generator',
    profile: '6/3',
    authority: 'emotional',
    definition: 'split',
    cross: [55, 59, 9, 16],
    slug: 'lax-spirit',
  },
  Oprah: {
    type: 'generator',
    profile: '2/4',
    authority: 'emotional',
    definition: 'tripleSplit',
    cross: [19, 33, 44, 24],
    slug: 'rax-four-ways',
  },
  Lennon: {
    type: 'generator',
    profile: '2/4',
    authority: 'emotional',
    definition: 'single',
    cross: [57, 51, 53, 54],
    slug: 'rax-penetration',
  },
  Monroe: {
    type: 'projector',
    profile: '6/2',
    authority: 'emotional',
    definition: 'split',
    cross: [16, 9, 63, 64],
    slug: 'lax-identification',
  },
  Putin: {
    type: 'manifestor',
    profile: '5/1',
    authority: 'splenic',
    definition: 'single',
    cross: [48, 21, 53, 54],
    slug: 'lax-endeavour',
  },
  Hefner: {
    type: 'projector',
    profile: '5/1',
    authority: 'emotional',
    definition: 'tripleSplit',
    cross: [51, 57, 61, 62],
    slug: 'lax-clarion',
  },
  Bullock: {
    type: 'reflector',
    profile: '2/4',
    authority: 'lunar',
    definition: 'none',
    cross: [31, 41, 27, 28],
    slug: 'rax-unexpected',
  },
};

describe('chart pubblicati (BirthInput locale + fuso IANA)', () => {
  let engine: Engine;
  beforeAll(async () => {
    engine = await getEngine();
  });

  it('copre i 10 chart di riferimento', () => {
    expect(golden.published.map((p) => p.name).sort()).toEqual(Object.keys(PUBLISHED).sort());
  });

  for (const p of golden.published) {
    const exp = PUBLISHED[p.name]!;
    it(`${p.name}: tipo, profilo, autorità, definizione e croce`, () => {
      const chart = engine.computeChart(birth(p.date, p.time, p.timezone));
      expect(chart.type).toBe(exp.type);
      expect(chart.profile.id).toBe(exp.profile);
      expect(chart.authority).toBe(exp.authority);
      expect(chart.definition).toBe(exp.definition);
      expect(Object.values(chart.cross.gates)).toEqual(exp.cross);
      expect(chart.cross.slug.startsWith(exp.slug)).toBe(true);
      expect(chart.input?.date).toBe(p.date);
    });

    if (!p.lmtOracle) {
      it(`${p.name}: UTC da fuso IANA uguale a zoneinfo e chart identico all'oracolo`, () => {
        const chart = engine.computeChart(birth(p.date, p.time, p.timezone));
        expect(chart.utc).toBe(p.utc);
        const r = compareWithOracle(engine, chart, p);
        expect(r.diffs).toEqual([]);
        expect(r.boundary).toEqual([]);
      });
    }
  }

  it("Einstein: con il tempo medio locale di Ulm (+0:39:58) identico all'oracolo", () => {
    const p = golden.published.find((x) => x.name === 'Einstein')!;
    const chart = engine.computeChartFromUtc(new Date(p.utc));
    expect(compareWithOracle(engine, chart, p).diffs).toEqual([]);
  });

  it("Einstein con 'Europe/Berlin' usa l'LMT di tzdb e produce comunque lo stesso riepilogo pubblicato", () => {
    const chart = engine.computeChart(birth('1879-03-14', '11:30', 'Europe/Berlin'));
    expect(chart.timeWarnings.map((w) => w.code)).toContain('historicalTimezone');
    expect(chart.type).toBe('generator');
    expect(chart.profile.id).toBe('1/4');
    expect(chart.authority).toBe('emotional');
    expect(chart.definition).toBe('split');
    expect(Object.values(chart.cross.gates)).toEqual([36, 6, 11, 12]);
    expect(chart.cross.name).toBe('Right Angle Cross of Eden 1');
  });

  it('Ra Uru Hu: canali pubblicati e variabili coerenti', () => {
    const chart = engine.computeChart(birth('1948-04-09', '00:05', 'America/Toronto'));
    expect(chart.channels).toEqual(['10-20', '10-57', '20-57', '23-43', '25-51']);
    expect(chart.strategy).toBe('inform');
    expect(chart.cross.angle).toBe('left');
    expect(chart.cross.quarter).toBe('initiation');
    expect(chart.variables.notation).toMatch(/^P[LR]{2} D[LR]{2}$/);
  });
});
