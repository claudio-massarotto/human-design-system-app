import { beforeAll, describe, expect, it } from 'vitest';
import { BODIES, type Chart } from '@hd/core';
import { getContent } from '@hd/content';
import { MILANO, ROMA, getTestEngine, savedChart } from '../features/today/testUtils';
import { matchesQuery, norm } from './peopleSearch';

const content = getContent('it');
const anna = {
  ...savedChart('a', 'Anna Rossi', ROMA, 1),
  notes: 'collega di studio',
  tags: ['Clienti', 'Studio legale'],
};
const marco = savedChart('b', 'Marco', MILANO, 2);
let chartA: Chart;
let chartB: Chart;

beforeAll(async () => {
  const engine = await getTestEngine();
  chartA = engine.computeChart(anna.birth);
  chartB = engine.computeChart(marco.birth);
});

const match = (q: string, who: 'a' | 'b' = 'a') =>
  who === 'a'
    ? matchesQuery(anna, chartA, q, content, 'Altro')
    : matchesQuery(marco, chartB, q, content, 'Altro');

describe('matchesQuery', () => {
  it('ricerca vuota: tutti', () => {
    expect(match('')).toBe(true);
    expect(match('   ')).toBe(true);
  });

  it('nome, luogo e note, senza badare a maiuscole e accenti', () => {
    expect(match('anna')).toBe(true);
    expect(match('ROSSI')).toBe(true);
    expect(match('roma')).toBe(true);
    expect(match('studio')).toBe(true);
    expect(match('anna', 'b')).toBe(false);
    expect(norm('Plèxus Solàre')).toBe('plexus solare');
  });

  it('trova anche le etichette, senza badare a maiuscole e accenti', () => {
    expect(match('clienti')).toBe(true);
    expect(match('CLIÈNTI')).toBe(true);
    expect(match('legale')).toBe(true);
    expect(match('clienti studio')).toBe(true);
    expect(match('clienti', 'b')).toBe(false);
  });

  it('tipo e profilo del chart calcolato', () => {
    const type = content.types[chartA.type]!.name;
    expect(match(type.toLowerCase())).toBe(true);
    expect(match(chartA.profile.id)).toBe(true);
  });

  it('porta, porta.linea e canale', () => {
    const sun = chartA.personality.sun;
    expect(match(String(sun.gate))).toBe(true);
    expect(match(`${sun.gate}.${sun.line}`)).toBe(true);
    const absent = Array.from({ length: 64 }, (_, i) => i + 1).find(
      (g) => !chartA.gates.some((x) => x.gate === g),
    )!;
    expect(match(String(absent))).toBe(false);
    const otherLine = (sun.line % 6) + 1;
    const hasOther = [chartA.personality, chartA.design].some((set) =>
      BODIES.some((b) => set[b].gate === sun.gate && set[b].line === otherLine),
    );
    expect(match(`${sun.gate}.${otherLine}`)).toBe(hasOther);
    const [channel] = chartA.channels;
    if (channel) {
      expect(match(channel)).toBe(true);
      // l'ordine delle due porte non conta
      expect(match(channel.split('-').reverse().join('-'))).toBe(true);
    }
    expect(match('99-98')).toBe(false);
  });

  it('più parole: devono corrispondere tutte', () => {
    expect(match('anna roma')).toBe(true);
    expect(match('anna milano')).toBe(false);
  });

  it('senza chart calcolato cerca solo nel testo', () => {
    expect(matchesQuery(anna, null, 'anna', content, 'Altro')).toBe(true);
    expect(matchesQuery(anna, null, '41', content, 'Altro')).toBe(false);
  });
});
