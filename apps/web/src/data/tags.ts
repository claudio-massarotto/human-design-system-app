// Etichette libere sui chart: normalizzazione e raccolta. Funzioni pure.
import { MAX_TAG_LENGTH, MAX_TAGS } from './types';

/** Chiave di confronto: senza maiuscole né accenti ("Clienti" = "clienti" = "Clièntì"). */
export function tagKey(tag: string): string {
  return tag.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Spazi compattati e tagliati; lunghezza massima `MAX_TAG_LENGTH`. Stringa vuota se non resta nulla. */
export function normalizeTag(tag: string): string {
  return tag.replace(/\s+/g, ' ').trim().slice(0, MAX_TAG_LENGTH).trim();
}

/**
 * Normalizza un elenco: scarta vuote, elimina i doppioni senza badare a maiuscole/accenti
 * (vince la prima) e si ferma a `MAX_TAGS`.
 */
export function normalizeTags(tags: readonly string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of tags) {
    const tag = normalizeTag(raw);
    if (!tag) continue;
    const key = tagKey(tag);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(tag);
    if (out.length >= MAX_TAGS) break;
  }
  return out;
}

/** Tutte le etichette in uso, senza doppioni, in ordine alfabetico. */
export function collectTags(charts: ReadonlyArray<{ tags?: readonly string[] }>): string[] {
  const byKey = new Map<string, string>();
  for (const chart of charts) {
    for (const tag of chart.tags ?? []) {
      const key = tagKey(tag);
      if (!byKey.has(key)) byKey.set(key, tag);
    }
  }
  return [...byKey.values()].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

export function hasTag(chart: { tags?: readonly string[] }, tag: string): boolean {
  const key = tagKey(tag);
  return (chart.tags ?? []).some((t) => tagKey(t) === key);
}
