import { describe, expect, it } from 'vitest';
import { CROSS_NAMES } from '@hd/core/data';
import { crosses as itCrosses } from '../src/it/crosses';
import { crosses as enCrosses } from '../src/en/crosses';

const slugs = Object.keys(CROSS_NAMES);

describe.each([
  ['it', itCrosses],
  ['en', enCrosses],
] as const)('crosses (%s)', (locale, crosses) => {
  it('ha esattamente le chiavi di CROSS_NAMES', () => {
    expect(slugs).toHaveLength(112);
    expect(Object.keys(crosses).sort()).toEqual([...slugs].sort());
  });

  it('slug, nome e summary sono coerenti e non vuoti', () => {
    for (const slug of slugs) {
      const c = crosses[slug]!;
      expect(c.slug).toBe(slug);
      expect(c.name.trim().length).toBeGreaterThan(0);
      expect(c.summary.trim().length).toBeGreaterThan(0);
    }
  });

  it(locale === 'it' ? 'i nomi iniziano con "Croce "' : 'i nomi coincidono con CROSS_NAMES', () => {
    for (const slug of slugs) {
      if (locale === 'it') expect(crosses[slug]!.name.startsWith('Croce ')).toBe(true);
      else expect(crosses[slug]!.name).toBe(CROSS_NAMES[slug]);
    }
  });
});
