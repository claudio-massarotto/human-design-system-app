import { describe, expect, it } from 'vitest';
import { BODIES, CENTERS, CHANNELS } from '@hd/core/data';
import { channels as itChannels } from '../src/it/channels';
import { centers as itCenters } from '../src/it/centers';
import { circuits as itCircuits } from '../src/it/circuits';
import { quarters as itQuarters } from '../src/it/quarters';
import { planets as itPlanets } from '../src/it/planets';
import { disclaimer as itDisclaimer } from '../src/it/meta';
import { channels as enChannels } from '../src/en/channels';
import { centers as enCenters } from '../src/en/centers';
import { circuits as enCircuits } from '../src/en/circuits';
import { quarters as enQuarters } from '../src/en/quarters';
import { planets as enPlanets } from '../src/en/planets';
import { disclaimer as enDisclaimer } from '../src/en/meta';

const CIRCUIT_IDS = [
  'individualKnowing',
  'individualCentering',
  'integration',
  'collectiveLogic',
  'collectiveAbstract',
  'tribalEgo',
  'tribalDefense',
];
const QUARTER_IDS = ['initiation', 'civilization', 'duality', 'mutation'];

function strings(value: unknown, path = ''): [string, string][] {
  if (typeof value === 'string') return [[path, value]];
  if (Array.isArray(value)) return value.flatMap((v, i) => strings(v, `${path}[${i}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => strings(v, `${path}.${k}`));
  }
  return [];
}

function noEmpty(value: unknown) {
  for (const [path, s] of strings(value)) {
    expect(s.trim().length, `stringa vuota in ${path}`).toBeGreaterThan(0);
  }
}

const locales = {
  it: {
    channels: itChannels,
    centers: itCenters,
    circuits: itCircuits,
    quarters: itQuarters,
    planets: itPlanets,
    disclaimer: itDisclaimer,
  },
  en: {
    channels: enChannels,
    centers: enCenters,
    circuits: enCircuits,
    quarters: enQuarters,
    planets: enPlanets,
    disclaimer: enDisclaimer,
  },
};

describe.each(Object.entries(locales))('struttura contenuti (%s)', (_locale, c) => {
  it('36 canali con chiavi uguali a CHANNELS e id coerente', () => {
    const ids = CHANNELS.map((ch) => ch.id).sort();
    expect(Object.keys(c.channels).sort()).toEqual(ids);
    expect(ids).toHaveLength(36);
    for (const [key, ch] of Object.entries(c.channels)) {
      expect(ch.id).toBe(key);
      expect(ch.keywords.length).toBeGreaterThanOrEqual(3);
      expect(ch.keywords.length).toBeLessThanOrEqual(5);
      expect(ch.description.split('\n\n')).toHaveLength(2);
    }
    noEmpty(c.channels);
  });

  it('9 centri', () => {
    expect(Object.keys(c.centers).sort()).toEqual([...CENTERS].sort());
    for (const [key, ce] of Object.entries(c.centers)) expect(ce.id).toBe(key);
    noEmpty(c.centers);
  });

  it('7 circuiti', () => {
    expect(Object.keys(c.circuits).sort()).toEqual([...CIRCUIT_IDS].sort());
    for (const [key, ci] of Object.entries(c.circuits)) expect(ci.id).toBe(key);
    noEmpty(c.circuits);
  });

  it('4 quarti', () => {
    expect(Object.keys(c.quarters).sort()).toEqual([...QUARTER_IDS].sort());
    for (const [key, q] of Object.entries(c.quarters)) expect(q.id).toBe(key);
    noEmpty(c.quarters);
  });

  it('13 pianeti', () => {
    expect(Object.keys(c.planets).sort()).toEqual([...BODIES].sort());
    expect(BODIES).toHaveLength(13);
    for (const [key, p] of Object.entries(c.planets)) expect(p.body).toBe(key);
    noEmpty(c.planets);
  });

  it('disclaimer non vuoto', () => {
    expect(c.disclaimer.trim().length).toBeGreaterThan(40);
  });
});
