import { beforeAll, describe, expect, it } from 'vitest';
import {
  BODIES,
  CHANNELS,
  longitudeToActivation,
  type ActivationSet,
  type Engine,
  type Gate,
  type Transit,
} from '@hd/core';
import type { TransitFn } from './sunCalendar';
import { skyState, transitTimeline } from './timeline';
import { getTestEngine } from './testUtils';

const HOUR = 3_600_000;
const MOON_PER_HOUR = 0.55; // ~13,2°/giorno

/**
 * Cielo finto: tutti i corpi fermi nella porta 30 (327°), la Luna parte da 300° (porta 60)
 * ed entra nella 41 a 302° (dopo ~3,64 h) e nella 19 a 307,625° (dopo ~13,86 h).
 */
function fakeCompute(epoch: number): TransitFn {
  return (at) => {
    const moon = 300 + ((at.getTime() - epoch) / HOUR) * MOON_PER_HOUR;
    const activations = Object.fromEntries(
      BODIES.map((body) => [
        body,
        { ...longitudeToActivation(body === 'moon' ? moon : 327), body, side: 'transit' },
      ]),
    ) as unknown as ActivationSet;
    const gates = new Set<Gate>(BODIES.map((b) => activations[b].gate));
    const channels = CHANNELS.filter((c) => c.gates.every((g) => gates.has(g))).map((c) => c.id);
    return { at: at.toISOString(), activations, gates: [...gates], channels } as Transit;
  };
}

describe('transitTimeline (dati finti)', () => {
  const epoch = Date.UTC(2026, 10, 3, 12, 0);
  const compute = fakeCompute(epoch);
  const timeline = transitTimeline(compute, skyState, new Date(epoch), { precisionMs: 1000 });

  it('trova i due ingressi della Luna con la precisione richiesta', () => {
    const ingresses = timeline.events.filter((e) => e.kind === 'ingress');
    expect(ingresses.map((e) => [e.body, e.fromGate, e.gate])).toEqual([
      ['moon', 60, 41],
      ['moon', 41, 19],
    ]);
    const expected = [2 / MOON_PER_HOUR, 7.625 / MOON_PER_HOUR].map((h) => epoch + h * HOUR);
    ingresses.forEach((e, i) => {
      expect(Math.abs(e.at.getTime() - expected[i]!)).toBeLessThan(2000);
    });
  });

  it('il canale 30-41 e i suoi centri si accendono e si spengono con la Luna nella 41', () => {
    expect(
      timeline.events.map((e) => (e.kind === 'ingress' ? e.kind : `${e.kind}:${e.id}`)),
    ).toEqual([
      'ingress',
      'channelOn:30-41',
      'centerOn:solarPlexus',
      'centerOn:root',
      'ingress',
      'channelOff:30-41',
      'centerOff:solarPlexus',
      'centerOff:root',
    ]);
    const [channel] = timeline.channels;
    expect(channel?.id).toBe('30-41');
    expect(channel?.spans).toHaveLength(1);
    expect(channel!.spans[0]!.start.getTime()).toBe(timeline.events[0]!.at.getTime());
    expect(channel!.spans[0]!.end.getTime()).toBe(timeline.events[4]!.at.getTime());
    expect(timeline.centers.map((c) => c.id)).toEqual(['solarPlexus', 'root']);
  });

  it('i tratti di ogni corpo coprono la finestra senza buchi', () => {
    expect(timeline.to.getTime() - timeline.from.getTime()).toBe(24 * HOUR);
    for (const { body, spans } of timeline.bodies) {
      expect(spans[0]!.start).toEqual(timeline.from);
      expect(spans.at(-1)!.end).toEqual(timeline.to);
      for (let i = 1; i < spans.length; i++) expect(spans[i]!.start).toEqual(spans[i - 1]!.end);
      expect(spans.map((s) => s.gate)).toEqual(body === 'moon' ? [60, 41, 19] : [30]);
    }
  });

  it("quello che è già attivo all'inizio non è un evento", () => {
    const later = transitTimeline(compute, skyState, new Date(epoch + 5 * HOUR), { hours: 4 });
    expect(later.events).toEqual([]);
    expect(later.channels.map((c) => c.id)).toEqual(['30-41']);
  });
});

describe('transitTimeline (motore reale)', () => {
  let engine: Engine;
  beforeAll(async () => {
    engine = await getTestEngine();
  });

  it('la Luna cambia porta almeno due volte e ogni ingresso è al minuto giusto', () => {
    const from = new Date(Date.UTC(2026, 10, 3, 14, 30));
    const compute: TransitFn = (d) => engine.computeTransit(d);
    const timeline = transitTimeline(compute, skyState, from);
    const moon = timeline.events.filter((e) => e.kind === 'ingress' && e.body === 'moon');
    expect(moon.length).toBeGreaterThanOrEqual(2);
    for (const e of timeline.events) {
      if (e.kind !== 'ingress') continue;
      expect(compute(e.at).activations[e.body].gate).toBe(e.gate);
      expect(compute(new Date(e.at.getTime() - 61_000)).activations[e.body].gate).toBe(e.fromGate);
    }
  });
});
