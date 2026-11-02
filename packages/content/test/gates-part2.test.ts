import { describe, expect, it } from 'vitest';
import { gates as itGates } from '../src/it/gates/part2';
import { gates as enGates } from '../src/en/gates/part2';

const expectedKeys = Array.from({ length: 32 }, (_, i) => 33 + i);

describe.each([
  ['it', itGates],
  ['en', enGates],
] as const)('gates part2 (%s)', (_locale, gates) => {
  it('contains exactly gates 33-64', () => {
    expect(Object.keys(gates).map(Number).sort((a, b) => a - b)).toEqual(expectedKeys);
  });

  it.each(expectedKeys)('gate %i is well formed', (n) => {
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
    for (const line of [1, 2, 3, 4, 5, 6] as const) {
      const l = g.lines[line];
      expect(l.title.trim()).not.toBe('');
      expect(l.text.trim()).not.toBe('');
      expect(l.title.trim().split(/\s+/).length).toBeLessThanOrEqual(6);
    }
  });
});

describe('gates part2 it vs en', () => {
  it.each(expectedKeys)('gate %i texts differ between locales', (n) => {
    const a = itGates[n]!;
    const b = enGates[n]!;
    expect(a.summary).not.toBe(b.summary);
    expect(a.description).not.toBe(b.description);
    expect(a.high).not.toBe(b.high);
    expect(a.low).not.toBe(b.low);
    for (const line of [1, 2, 3, 4, 5, 6] as const) {
      expect(a.lines[line].text).not.toBe(b.lines[line].text);
    }
  });
});
