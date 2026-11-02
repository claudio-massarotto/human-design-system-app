import { describe, expect, it } from 'vitest';
import { CHANNELS, CROSS_NAMES } from '@hd/core/data';
import { getContent, LOCALES } from '../src/index';

const it_ = getContent('it');
const en = getContent('en');

describe('bundle dei contenuti', () => {
  it('entrambe le lingue sono disponibili', () => {
    expect(LOCALES).toEqual(['it', 'en']);
    expect(it_.locale).toBe('it');
    expect(en.locale).toBe('en');
  });

  it('IT e EN hanno esattamente le stesse chiavi in ogni sezione', () => {
    const sections = [
      'gates', 'channels', 'centers', 'types', 'authorities', 'profiles', 'lines',
      'definitions', 'crosses', 'circuits', 'quarters', 'planets',
    ] as const;
    for (const s of sections) {
      expect(Object.keys(en[s]).sort(), s).toEqual(Object.keys(it_[s]).sort());
    }
  });

  it('copertura completa: 64 porte, 36 canali, 112 croci', () => {
    for (const c of [it_, en]) {
      expect(Object.keys(c.gates)).toHaveLength(64);
      expect(Object.keys(c.channels).sort()).toEqual(CHANNELS.map((ch) => ch.id).sort());
      expect(Object.keys(c.crosses).sort()).toEqual(Object.keys(CROSS_NAMES).sort());
      expect(c.disclaimer.length).toBeGreaterThan(40);
    }
  });
});
