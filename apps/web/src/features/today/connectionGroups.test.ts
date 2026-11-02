import { describe, expect, it } from 'vitest';
import type { CompositeChannel } from '@hd/core';
import {
  channelCarriers,
  chartGateSet,
  CONNECTION_KINDS,
  groupChannelsByKind,
  parseTheme,
  themeBucket,
} from './connectionGroups';
import { channelGateSources, fromInputValue, toInputValue, addDays } from './transitInsights';

const channels: CompositeChannel[] = [
  { id: '34-57', kind: 'companionship' },
  { id: '10-20', kind: 'electromagnetic' },
  { id: '1-8', kind: 'dominance', owner: 'a' },
  { id: '5-15', kind: 'compromise', owner: 'b' },
  { id: '2-14', kind: 'electromagnetic' },
  { id: '10-34', kind: 'dominance', owner: 'b' },
];

describe('groupChannelsByKind', () => {
  it("ha sempre le quattro dinamiche, nell'ordine di presentazione", () => {
    expect(CONNECTION_KINDS).toEqual([
      'electromagnetic',
      'compromise',
      'dominance',
      'companionship',
    ]);
    expect(Object.keys(groupChannelsByKind([])).sort()).toEqual([...CONNECTION_KINDS].sort());
  });

  it('raggruppa per dinamica e ordina i canali per numero di porta', () => {
    const g = groupChannelsByKind(channels);
    expect(g.electromagnetic.map((c) => c.id)).toEqual(['2-14', '10-20']);
    expect(g.compromise.map((c) => c.id)).toEqual(['5-15']);
    expect(g.dominance.map((c) => c.id)).toEqual(['1-8', '10-34']);
    expect(g.companionship.map((c) => c.id)).toEqual(['34-57']);
    expect(Object.values(g).flat()).toHaveLength(channels.length);
  });

  it('conserva il proprietario nei canali di compromesso e dominanza', () => {
    const g = groupChannelsByKind(channels);
    expect(g.dominance[0]!.owner).toBe('a');
    expect(g.compromise[0]!.owner).toBe('b');
  });
});

describe('channelCarriers', () => {
  const a = chartGateSet({
    gates: [
      { gate: 34, personality: ['sun'], design: [] },
      { gate: 20, personality: [], design: ['moon'] },
    ],
  });
  const b = chartGateSet({
    gates: [
      { gate: 20, personality: ['sun'], design: [] },
      { gate: 57, personality: [], design: ['mars'] },
    ],
  });
  it('dice quali porte del canale porta ciascuno', () => {
    expect(channelCarriers('34-57', a, b)).toEqual({ a: [34], b: [57] });
    expect(channelCarriers('20-34', a, b)).toEqual({ a: [20, 34], b: [20] });
    expect(channelCarriers('1-8', a, b)).toEqual({ a: [], b: [] });
  });
});

describe('tema di connessione', () => {
  it('scompone "7-2"', () => {
    expect(parseTheme('7-2')).toEqual({ defined: 7, open: 2 });
  });
  it('assegna una fascia di lettura', () => {
    expect(themeBucket(9)).toBe('veryDefined');
    expect(themeBucket(7)).toBe('defined');
    expect(themeBucket(5)).toBe('balanced');
    expect(themeBucket(2)).toBe('open');
  });
});

describe('transitInsights', () => {
  it('channelGateSources distingue porta tua e porta del cielo', () => {
    expect(channelGateSources('10-20', new Set([10]), new Set([20, 34]))).toEqual([
      { gate: 10, from: 'natal' },
      { gate: 20, from: 'transit' },
    ]);
  });
  it('data e ora per il campo datetime-local', () => {
    const d = new Date(2026, 10, 4, 9, 5);
    expect(toInputValue(d)).toBe('2026-11-04T09:05');
    expect(fromInputValue('2026-11-04T09:05')?.getTime()).toBe(d.getTime());
    expect(fromInputValue('')).toBeNull();
    expect(addDays(d, 1).getDate()).toBe(5);
    expect(addDays(d, -4).getMonth()).toBe(9);
  });
});
