import { describe, expect, it } from 'vitest';
import { gates as itGates } from '../src/it/gates/part1';
import { gates as enGates } from '../src/en/gates/part1';

const locales = { it: itGates, en: enGates } as const;
const expectedKeys = Array.from({ length: 32 }, (_, i) => i + 1);
const LINES = [1, 2, 3, 4, 5, 6] as const;

describe.each(Object.entries(locales))('gates part1 [%s]', (_name, gates) => {
  it('contains exactly gates 1-32', () => {
    expect(Object.keys(gates).map(Number).sort((a, b) => a - b)).toEqual(expectedKeys);
  });

  it.each(expectedKeys)('gate %i is well-formed', (n) => {
    const g = gates[n]!;
    expect(g.gate).toBe(n);
    for (const s of [g.name, g.hexagram, g.summary, g.description, g.high, g.low]) {
      expect(s.trim().length).toBeGreaterThan(0);
    }
    expect(g.description.split('\n\n')).toHaveLength(2);
    expect(g.keywords.length).toBeGreaterThanOrEqual(3);
    expect(g.keywords.length).toBeLessThanOrEqual(5);
    g.keywords.forEach((k) => expect(k.trim()).not.toBe(''));
    for (const v of Object.values(g.geneKeys)) expect(v.trim()).not.toBe('');
    for (const l of LINES) {
      const line = g.lines[l];
      expect(line.title.trim().length).toBeGreaterThan(0);
      expect(line.text.trim().length).toBeGreaterThan(0);
      expect(line.title.trim().split(/\s+/).length).toBeLessThanOrEqual(6);
    }
  });
});

describe('gates part1 IT vs EN', () => {
  it.each(expectedKeys)('gate %i differs between locales', (n) => {
    const a = itGates[n]!;
    const b = enGates[n]!;
    expect(a.summary).not.toBe(b.summary);
    expect(a.description).not.toBe(b.description);
    expect(a.high).not.toBe(b.high);
    expect(a.low).not.toBe(b.low);
    for (const l of LINES) expect(a.lines[l].text).not.toBe(b.lines[l].text);
  });
});
