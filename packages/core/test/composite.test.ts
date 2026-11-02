import { beforeAll, describe, expect, it } from 'vitest';
import { CHANNELS } from '../src/data/index';
import { composite } from '../src/composite/composite';
import { overlay } from '../src/transit/transit';
import type { Chart, Engine, Transit } from '../src/types';
import { getEngine, handChart, prng } from './helpers';

const kinds = (a: number[], b: number[]) =>
  Object.fromEntries(
    composite(handChart(a), handChart(b)).channels.map((c) => [
      c.id,
      c.owner ? `${c.kind}:${c.owner}` : c.kind,
    ]),
  );

describe('composite — casi costruiti a mano', () => {
  it('electromagnetic: ciascuno porta una porta, nessuno ha il canale', () => {
    const r = composite(handChart([1]), handChart([8]));
    expect(r.channels).toEqual([{ id: '1-8', kind: 'electromagnetic' }]);
    expect(r.definedCenters).toEqual(['throat', 'g']);
    expect(r.centers.g).toBe('defined');
    expect(r.centers.throat).toBe('defined');
    expect(r.centers.head).toBe('open');
    expect(r.theme).toBe('2-7');
    expect(r.definition).toBe('single');
  });

  it('companionship: entrambi hanno il canale completo', () => {
    expect(kinds([1, 8], [1, 8, 20])).toEqual({ '1-8': 'companionship' });
  });

  it("compromise: uno ha il canale, l'altro una sola porta (owner = chi ha il canale)", () => {
    expect(kinds([1, 8], [8])).toEqual({ '1-8': 'compromise:a' });
    expect(kinds([1], [1, 8])).toEqual({ '1-8': 'compromise:b' });
  });

  it("dominance: uno ha il canale, l'altro nessuna porta", () => {
    expect(kinds([1, 8], [64])).toEqual({ '1-8': 'dominance:a' });
    expect(kinds([], [1, 8])).toEqual({ '1-8': 'dominance:b' });
  });

  it('nessun canale se la stessa porta è in entrambi o i due non completano nulla', () => {
    expect(composite(handChart([1]), handChart([1])).channels).toEqual([]);
    expect(composite(handChart([1, 2, 3]), handChart([4, 5, 6])).channels).toEqual([]);
  });

  it('gruppo 10/20/34/57: più canali con tipi diversi per lo stesso chart', () => {
    // A: 10, 20 (canale 10-20); B: 34, 57 (canale 34-57)
    expect(kinds([10, 20], [34, 57])).toEqual({
      '10-20': 'dominance:a',
      '10-34': 'electromagnetic',
      '10-57': 'electromagnetic',
      '20-34': 'electromagnetic',
      '20-57': 'electromagnetic',
      '34-57': 'dominance:b',
    });
  });

  it('centri: stato undefined per porte attive ma senza canale, open altrimenti', () => {
    const r = composite(handChart([1, 8, 64]), handChart([13]));
    // 1-8 dominance (a): g e throat definiti; 64 (head) attiva ma senza canale; 13 è del G (già definito)
    expect(r.centers.g).toBe('defined');
    expect(r.centers.head).toBe('undefined');
    expect(r.centers.ajna).toBe('open');
    expect(r.theme).toBe('2-7');
  });

  it('definizione del composito: due componenti → split; tema 4-5', () => {
    const r = composite(handChart([1, 8]), handChart([3, 60]));
    expect(r.channels.map((c) => c.kind)).toEqual(['dominance', 'dominance']);
    expect(r.definedCenters).toEqual(['throat', 'g', 'sacral', 'root']);
    expect(r.definition).toBe('split');
    expect(r.theme).toBe('4-5');
  });

  it('composito vuoto: definizione none, tema 0-9', () => {
    const r = composite(handChart([1]), handChart([2]));
    expect(r.channels).toEqual([]);
    expect(r.definition).toBe('none');
    expect(r.theme).toBe('0-9');
  });
});

describe('composite — chart reali', () => {
  let engine: Engine;
  const charts: Chart[] = [];
  beforeAll(async () => {
    engine = await getEngine();
    const rnd = prng(99);
    for (let i = 0; i < 30; i++)
      charts.push(
        engine.computeChartFromUtc(new Date(Date.UTC(1950, 0, 1) + Math.floor(rnd() * 2.5e12))),
      );
  });

  it('simmetria: scambiando a e b cambiano solo gli owner; tema coerente con i centri definiti', () => {
    for (let i = 0; i < charts.length - 1; i++) {
      const ab = engine.composite(charts[i]!, charts[i + 1]!);
      const ba = engine.composite(charts[i + 1]!, charts[i]!);
      const flip = (o?: 'a' | 'b') => (o ? (o === 'a' ? 'b' : 'a') : undefined);
      expect(ba.channels).toEqual(ab.channels.map((c) => ({ ...c, owner: flip(c.owner) })));
      expect(ab.definedCenters).toEqual(ba.definedCenters);
      expect(ab.theme).toBe(`${ab.definedCenters.length}-${9 - ab.definedCenters.length}`);
    }
  });

  it('il composito contiene tutti i canali dei due chart; con sé stesso è tutto companionship', () => {
    for (let i = 0; i < charts.length - 1; i++) {
      const a = charts[i]!;
      const b = charts[i + 1]!;
      const ids = engine.composite(a, b).channels.map((c) => c.id);
      for (const id of [...a.channels, ...b.channels]) expect(ids).toContain(id);
      expect(ids.length).toBeLessThanOrEqual(CHANNELS.length);
      const self = engine.composite(a, a);
      expect(self.channels.every((c) => c.kind === 'companionship')).toBe(true);
      expect(self.channels.map((c) => c.id)).toEqual(a.channels);
      expect(self.definedCenters).toEqual(a.definedCenters);
      expect(self.definition).toBe(a.definition);
    }
  });
});

describe('transit e overlay', () => {
  let engine: Engine;
  beforeAll(async () => {
    engine = await getEngine();
  });

  it('transito: 13 attivazioni side "transit", porte ordinate, canali dal solo transito', () => {
    const at = new Date('2026-11-02T12:00:00Z');
    const t = engine.computeTransit(at);
    expect(t.at).toBe('2026-11-02T12:00:00.000Z');
    expect(Object.keys(t.activations)).toHaveLength(13);
    for (const a of Object.values(t.activations)) expect(a.side).toBe('transit');
    expect(t.gates).toEqual(
      [...new Set(Object.values(t.activations).map((a) => a.gate))].sort((x, y) => x - y),
    );
    for (const id of t.channels) {
      const [a, b] = id.split('-').map(Number) as [number, number];
      expect(t.gates).toContain(a);
      expect(t.gates).toContain(b);
    }
    // stessa posizione della Personalità di un chart calcolato allo stesso istante
    const c = engine.computeChartFromUtc(at);
    expect(t.activations.sun.longitude).toBe(c.personality.sun.longitude);
    expect(t.activations.moon).toMatchObject({
      gate: c.personality.moon.gate,
      line: c.personality.moon.line,
    });
    expect(t.gates).toEqual(
      [...new Set(Object.values(c.personality).map((a) => a.gate))].sort((x, y) => x - y),
    );
  });

  it('transito con nodo medio usa il nodo medio', () => {
    const at = new Date('2026-11-02T12:00:00Z');
    const m = engine.computeTransit(at, { node: 'mean' });
    const t = engine.computeTransit(at);
    expect(m.activations.northNode.longitude).not.toBe(t.activations.northNode.longitude);
  });

  it('overlay a mano: il transito completa il canale 1-8', () => {
    const natal = handChart([1, 13]);
    const transit = {
      at: 'x',
      activations: {},
      gates: [8, 13],
      channels: [],
    } as unknown as Transit;
    const o = overlay(natal, transit);
    expect(o.channels).toEqual(['1-8']);
    expect(o.newChannels).toEqual(['1-8']);
    expect(o.centersDefinedByTransit).toEqual(['throat', 'g']);
    expect(o.transitOnlyGates).toEqual([8]);
    expect(o.centers.g).toBe('defined');
    expect(o.centers.throat).toBe('defined');
    expect(o.centers.sacral).toBe('open');
  });

  it('overlay a mano: canale già definito nel natale non è "nuovo"; centro già definito non compare', () => {
    const natal = handChart([1, 8]);
    const transit = {
      at: 'x',
      activations: {},
      gates: [1, 8, 13, 33],
      channels: ['1-8', '13-33'],
    } as unknown as Transit;
    const o = overlay(natal, transit);
    expect(o.channels).toEqual(['1-8', '13-33']);
    expect(o.newChannels).toEqual(['13-33']);
    expect(o.centersDefinedByTransit).toEqual([]); // G e Gola già definiti dal natale
    expect(o.transitOnlyGates).toEqual([13, 33]);
  });

  it('overlay a mano: porta di transito che con il natale crea un canale tra centri nuovi', () => {
    const natal = handChart([34]); // Sacrale: porta attiva, centro non definito
    const transit = { at: 'x', activations: {}, gates: [20], channels: [] } as unknown as Transit;
    const o = overlay(natal, transit);
    expect(o.newChannels).toEqual(['20-34']);
    expect(o.centersDefinedByTransit).toEqual(['throat', 'sacral']);
    expect(natal.centers.sacral).toBe('undefined');
  });

  it('overlay su chart reali: invarianti', () => {
    const natal = engine.computeChartFromUtc(new Date('1985-10-08T22:35:11Z'));
    for (const day of [0, 5, 10, 17, 40, 90, 200]) {
      const t = engine.computeTransit(new Date(Date.UTC(2026, 10, 2 + day, 6)));
      const o = overlay(natal, t);
      for (const id of [...natal.channels, ...t.channels]) expect(o.channels).toContain(id);
      expect(o.newChannels.some((id) => natal.channels.includes(id))).toBe(false);
      expect(o.newChannels.length + natal.channels.length).toBe(o.channels.length);
      expect(o.transitOnlyGates.every((g) => !natal.gates.some((x) => x.gate === g))).toBe(true);
      for (const c of o.centersDefinedByTransit) {
        expect(natal.centers[c]).not.toBe('defined');
        expect(o.centers[c]).toBe('defined');
      }
      for (const c of natal.definedCenters) expect(o.centers[c]).toBe('defined');
    }
  });
});
