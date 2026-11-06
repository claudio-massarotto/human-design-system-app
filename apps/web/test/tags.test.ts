import { describe, expect, it } from 'vitest';
import { collectTags, hasTag, normalizeTag, normalizeTags, tagKey } from '../src/data/tags';
import { MAX_TAG_LENGTH, MAX_TAGS } from '../src/data/types';

describe('etichette', () => {
  it('normalizeTag compatta gli spazi e limita la lunghezza', () => {
    expect(normalizeTag('  Studio \t legale ')).toBe('Studio legale');
    expect(normalizeTag('   ')).toBe('');
    expect(normalizeTag('a'.repeat(100))).toHaveLength(MAX_TAG_LENGTH);
  });

  it('tagKey ignora maiuscole e accenti', () => {
    expect(tagKey('Clièntì')).toBe('clienti');
    expect(tagKey('CLIENTI')).toBe(tagKey('clienti'));
  });

  it('normalizeTags: scarta vuote e doppioni (vince la prima grafia), limita il numero', () => {
    expect(normalizeTags(['Clienti', ' clienti', 'CLIÈNTI', '', 'Studio'])).toEqual([
      'Clienti',
      'Studio',
    ]);
    expect(normalizeTags(Array.from({ length: 30 }, (_, i) => `e${i}`))).toHaveLength(MAX_TAGS);
  });

  it('collectTags: tutte le etichette in uso, senza doppioni, in ordine alfabetico', () => {
    expect(
      collectTags([{ tags: ['studio', 'Clienti'] }, {}, { tags: ['Studio', 'Amici'] }]),
    ).toEqual(['Amici', 'Clienti', 'studio']);
    expect(collectTags([])).toEqual([]);
  });

  it('hasTag confronta senza badare a maiuscole', () => {
    expect(hasTag({ tags: ['Clienti'] }, 'clienti')).toBe(true);
    expect(hasTag({ tags: ['Clienti'] }, 'Studio')).toBe(false);
    expect(hasTag({}, 'Clienti')).toBe(false);
  });
});
