import { beforeAll, describe, expect, it } from 'vitest';
import { BODIES } from '../src/data/bodies';
import { CENTERS, CENTER_GATES, CHANNELS } from '../src/data/index';
import type { Chart, Engine, ProfileId } from '../src/types';
import { getEngine, prng } from './helpers';

const VALID_PROFILES: ProfileId[] = [
  '1/3',
  '1/4',
  '2/4',
  '2/5',
  '3/5',
  '3/6',
  '4/6',
  '4/1',
  '5/1',
  '5/2',
  '6/2',
  '6/3',
];
const MS_DAY = 86_400_000;
const diff360 = (a: number, b: number): number => Math.abs(((((a - b) % 360) + 540) % 360) - 180);

describe('proprietà su 400 istanti casuali (1900–2030)', () => {
  let engine: Engine;
  const charts: Chart[] = [];
  beforeAll(async () => {
    engine = await getEngine();
    const rnd = prng(20261102);
    const t0 = Date.UTC(1900, 0, 1);
    const span = Date.UTC(2030, 11, 31) - t0;
    for (let i = 0; i < 400; i++)
      charts.push(engine.computeChartFromUtc(new Date(t0 + Math.floor(rnd() * span))));
  });

  it('Design tra 84 e 96 giorni prima, con il Sole a −88° (tolleranza < 1e-6°)', () => {
    for (const c of charts) {
      const days = (Date.parse(c.utc) - Date.parse(c.designUtc)) / MS_DAY;
      expect(days).toBeGreaterThan(84);
      expect(days).toBeLessThan(96);
      expect(diff360(c.personality.sun.longitude - 88, c.design.sun.longitude)).toBeLessThan(1e-6);
    }
  });

  it('Terra opposta al Sole, Nodo Sud opposto al Nodo Nord (Personalità e Design)', () => {
    for (const c of charts) {
      for (const set of [c.personality, c.design]) {
        expect(diff360(set.earth.longitude, set.sun.longitude + 180)).toBeLessThan(1e-9);
        expect(diff360(set.southNode.longitude, set.northNode.longitude + 180)).toBeLessThan(1e-9);
        expect(set.earth.speed).toBe(set.sun.speed);
        expect(set.southNode.speed).toBe(set.northNode.speed);
      }
    }
  });

  it('attivazioni: 13 + 13, lati e corpi corretti, retrogrado = velocità < 0', () => {
    for (const c of charts) {
      for (const [side, set] of [
        ['personality', c.personality],
        ['design', c.design],
      ] as const) {
        expect(Object.keys(set)).toEqual([...BODIES]);
        for (const b of BODIES) {
          expect(set[b].side).toBe(side);
          expect(set[b].body).toBe(b);
          expect(set[b].retrograde).toBe(set[b].speed < 0);
          expect(set[b].longitude).toBeGreaterThanOrEqual(0);
          expect(set[b].longitude).toBeLessThan(360 + 1e-9);
        }
        expect(set.sun.retrograde).toBe(false);
        expect(set.moon.retrograde).toBe(false);
        expect(set.moon.speed).toBeGreaterThan(10);
      }
    }
  });

  it('il profilo è uno dei 12 validi e coincide con le linee dei Soli', () => {
    for (const c of charts) {
      expect(VALID_PROFILES).toContain(c.profile.id);
      expect(c.profile.id).toBe(`${c.personality.sun.line}/${c.design.sun.line}`);
      expect(c.profile.personalityLine).toBe(c.personality.sun.line);
      expect(c.profile.designLine).toBe(c.design.sun.line);
    }
  });

  it('canali coerenti con le porte attive; porte appese = attive fuori dai canali', () => {
    for (const c of charts) {
      const active = new Set(c.gates.map((g) => g.gate));
      const expected = CHANNELS.filter(
        (ch) => active.has(ch.gates[0]) && active.has(ch.gates[1]),
      ).map((ch) => ch.id);
      expect(c.channels).toEqual(expected);
      const inCh = new Set(c.channels.flatMap((id) => id.split('-').map(Number)));
      expect(c.hangingGates).toEqual([...active].filter((g) => !inCh.has(g)).sort((a, b) => a - b));
      expect(c.gates.map((g) => g.gate)).toEqual([...active].sort((a, b) => a - b));
      // ogni porta attiva ha almeno un corpo, e tutti i 26 sono assegnati
      expect(c.gates.reduce((n, g) => n + g.personality.length + g.design.length, 0)).toBe(26);
    }
  });

  it('centri: definiti = estremi di canali; stato undefined/open dalle porte; componenti = partizione dei definiti', () => {
    for (const c of charts) {
      const active = new Set(c.gates.map((g) => g.gate));
      for (const center of CENTERS) {
        const touched = c.channels.some((id) =>
          id
            .split('-')
            .map(Number)
            .some((g) => CENTER_GATES[center].includes(g)),
        );
        const state = touched
          ? 'defined'
          : CENTER_GATES[center].some((g) => active.has(g))
            ? 'undefined'
            : 'open';
        expect(c.centers[center]).toBe(state);
      }
      expect(c.definedCenters).toEqual(CENTERS.filter((x) => c.centers[x] === 'defined'));
      expect(c.components.flat().sort()).toEqual([...c.definedCenters].sort());
      expect(c.components.length).toBeLessThanOrEqual(4);
      expect(c.definition).toBe(
        ['none', 'single', 'split', 'tripleSplit', 'quadrupleSplit'][c.components.length],
      );
    }
  });

  it('tipo, strategia e autorità coerenti con i centri', () => {
    const seen = { types: new Set<string>(), auth: new Set<string>() };
    for (const c of charts) {
      const has = (x: string): boolean => c.definedCenters.includes(x as never);
      seen.types.add(c.type);
      seen.auth.add(c.authority);
      if (c.definedCenters.length === 0) {
        expect(c.type).toBe('reflector');
        expect(c.authority).toBe('lunar');
        expect(c.definition).toBe('none');
      } else {
        expect(c.type).not.toBe('reflector');
        expect(['generator', 'manifestingGenerator'].includes(c.type)).toBe(has('sacral'));
        if (c.type === 'manifestor') expect(has('sacral')).toBe(false);
      }
      expect(c.strategy).toBe(
        {
          manifestor: 'inform',
          generator: 'respond',
          manifestingGenerator: 'respondThenInform',
          projector: 'waitForInvitation',
          reflector: 'waitLunarCycle',
        }[c.type],
      );
      if (has('solarPlexus')) expect(c.authority).toBe('emotional');
      else if (has('sacral')) expect(c.authority).toBe('sacral');
      else if (has('spleen')) expect(c.authority).toBe('splenic');
      if (c.authority === 'egoManifested') expect(c.type).toBe('manifestor');
      if (c.authority === 'egoProjected') expect(c.type).toBe('projector');
      // Un Proiettore non ha mai un motore collegato alla Gola
      if (c.type === 'projector')
        expect(['emotional', 'splenic', 'egoProjected', 'selfProjected', 'mental']).toContain(
          c.authority,
        );
    }
    // il campione copre tutti i tipi e le principali autorità
    for (const t of ['generator', 'manifestingGenerator', 'manifestor', 'projector'])
      expect(seen.types.has(t)).toBe(true);
    expect(seen.auth.has('emotional') && seen.auth.has('sacral') && seen.auth.has('splenic')).toBe(
      true,
    );
  });

  it('croce: angolo dal profilo, gates dalle attivazioni, nome e numero coerenti', () => {
    for (const c of charts) {
      const id = c.profile.id;
      expect(c.cross.angle).toBe(
        id === '4/1' ? 'juxtaposition' : id[0] === '5' || id[0] === '6' ? 'left' : 'right',
      );
      expect(c.cross.gates).toEqual({
        personalitySun: c.personality.sun.gate,
        personalityEarth: c.personality.earth.gate,
        designSun: c.design.sun.gate,
        designEarth: c.design.earth.gate,
      });
      expect(
        c.cross.slug.startsWith(
          { right: 'rax-', left: 'lax-', juxtaposition: 'jxt-' }[c.cross.angle],
        ),
      ).toBe(true);
      if (c.cross.angle === 'juxtaposition') expect(c.cross.number).toBeUndefined();
      else expect(c.cross.name.endsWith(` ${c.cross.number}`)).toBe(true);
      expect(c.cross.name).toMatch(/Cross of/);
      expect(['initiation', 'civilization', 'duality', 'mutation']).toContain(c.cross.quarter);
    }
  });

  it('variabili: frecce dal tono e notazione', () => {
    for (const c of charts) {
      const v = c.variables;
      expect(v.determination).toMatchObject({
        color: c.design.sun.color,
        tone: c.design.sun.tone,
        base: c.design.sun.base,
      });
      expect(v.environment).toMatchObject({
        color: c.design.northNode.color,
        tone: c.design.northNode.tone,
      });
      expect(v.motivation).toMatchObject({
        color: c.personality.sun.color,
        tone: c.personality.sun.tone,
      });
      expect(v.perspective).toMatchObject({
        color: c.personality.northNode.color,
        tone: c.personality.northNode.tone,
      });
      for (const x of [v.determination, v.environment, v.motivation, v.perspective])
        expect(x.arrow).toBe(x.tone <= 3 ? 'left' : 'right');
      const L = (x: { arrow: string }): string => (x.arrow === 'left' ? 'L' : 'R');
      expect(v.notation).toBe(
        `P${L(v.motivation)}${L(v.perspective)} D${L(v.determination)}${L(v.environment)}`,
      );
      expect(v.notation).toMatch(/^P[LR]{2} D[LR]{2}$/);
    }
  });

  it('JSON-serializzabile e utc/designUtc in ISO', () => {
    for (const c of charts.slice(0, 20)) {
      expect(c.utc).toMatch(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/);
      expect(c.designUtc).toMatch(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/);
      expect(JSON.parse(JSON.stringify(c))).toEqual(c);
      expect(c.input).toBeNull();
      expect(c.options).toEqual({ node: 'true' });
    }
  });

  it('lineBoundaryArcsec è sempre ≤ 1687.5"', () => {
    for (const c of charts.slice(0, 50))
      for (const b of BODIES)
        expect(c.personality[b].lineBoundaryArcsec).toBeLessThanOrEqual(1687.5 + 1e-6);
  });

  it('nodo medio: diverso dal vero ma entro ~2° (e velocità media ≈ −0.053°/giorno)', () => {
    const when = new Date(Date.UTC(1990, 5, 15, 12));
    const t = engine.computeChartFromUtc(when, { node: 'true' });
    const m = engine.computeChartFromUtc(when, { node: 'mean' });
    expect(m.options.node).toBe('mean');
    expect(
      diff360(t.personality.northNode.longitude, m.personality.northNode.longitude),
    ).toBeLessThan(2);
    expect(m.personality.northNode.speed).toBeCloseTo(-0.0529, 3);
    expect(m.personality.sun.longitude).toBe(t.personality.sun.longitude);
  });
});
