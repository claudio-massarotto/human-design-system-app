import { describe, expect, it } from 'vitest';
import { buildResources, namespaces, resources } from '../src/i18n/resources';

type Json = Record<string, unknown>;

function flatten(obj: Json, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object') Object.assign(out, flatten(v as Json, key));
    else out[key] = String(v);
  }
  return out;
}

const placeholders = (s: string) =>
  [...s.matchAll(/\{\{\s*([\w.]+)\s*\}\}/g)].map((m) => m[1]).sort();

describe('i18n: parità IT/EN', () => {
  it('ci sono i namespace di base e ogni namespace esiste in entrambe le lingue', () => {
    for (const ns of ['common', 'onboarding', 'people', 'settings'])
      expect(namespaces).toContain(ns);
    const itNs = Object.keys(resources.it ?? {}).sort();
    const enNs = Object.keys(resources.en ?? {}).sort();
    expect(enNs).toEqual(itNs);
  });

  // Il test itera sui namespace trovati con import.meta.glob: vale anche per quelli aggiunti in futuro.
  describe.each(namespaces)('namespace %s', (ns) => {
    const itFlat = flatten((resources.it?.[ns] ?? {}) as Json);
    const enFlat = flatten((resources.en?.[ns] ?? {}) as Json);

    it('ha le stesse chiavi in IT e EN', () => {
      const keysIt = Object.keys(itFlat).sort();
      const keysEn = Object.keys(enFlat).sort();
      expect(
        keysEn.filter((k) => !keysIt.includes(k)),
        'chiavi solo in EN',
      ).toEqual([]);
      expect(
        keysIt.filter((k) => !keysEn.includes(k)),
        'chiavi solo in IT',
      ).toEqual([]);
    });

    it('non ha traduzioni vuote', () => {
      for (const [k, v] of Object.entries(itFlat)) expect(v.trim(), `it:${ns}.${k}`).not.toBe('');
      for (const [k, v] of Object.entries(enFlat)) expect(v.trim(), `en:${ns}.${k}`).not.toBe('');
    });

    it('usa gli stessi segnaposto {{…}}', () => {
      for (const k of Object.keys(itFlat)) {
        if (!(k in enFlat)) continue;
        expect(placeholders(enFlat[k]!), `${ns}.${k}`).toEqual(placeholders(itFlat[k]!));
      }
    });
  });
});

describe('buildResources', () => {
  it('usa il nome del file come namespace', () => {
    const r = buildResources({
      './it/chart.json': { a: 'uno' },
      './en/chart.json': { a: 'one' },
      './it/other.json': { b: 'due' },
      './ignorato.json': {},
    });
    expect(Object.keys(r.it!).sort()).toEqual(['chart', 'other']);
    expect(r.en!.chart).toEqual({ a: 'one' });
  });
});
