// Ricerca nella pagina Persone: funzione pura su chart salvati e chart calcolati.
import { BODIES, type Chart } from '@hd/core';
import type { ContentBundle } from '@hd/content';
import type { SavedChart } from '../data/types';

/** Minuscolo e senza accenti: "Plèxus" e "plexus" coincidono. */
export function norm(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Testo libero su cui cercare: nome, luogo, relazione, tipo, autorità, profilo, definizione. */
function haystack(
  saved: SavedChart,
  chart: Chart | null,
  content: ContentBundle,
  relationLabel: string,
): string {
  const parts = [
    saved.name,
    saved.birth.place.name,
    saved.birth.place.country ?? '',
    relationLabel,
    saved.notes ?? '',
  ];
  if (chart) {
    parts.push(
      content.types[chart.type]?.name ?? chart.type,
      content.authorities[chart.authority]?.name ?? chart.authority,
      chart.profile.id,
      content.profiles[chart.profile.id]?.name ?? '',
      content.definitions[chart.definition]?.name ?? '',
    );
  }
  return norm(parts.join(' \u0001 '));
}

/**
 * Un token cerca: "41.3" una porta con quella linea, "41" una porta, "30-41" un canale,
 * altrimenti un pezzo di testo. Tutti i token devono corrispondere.
 */
export function matchesQuery(
  saved: SavedChart,
  chart: Chart | null,
  query: string,
  content: ContentBundle,
  relationLabel: string,
): boolean {
  const tokens = norm(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;
  const text = haystack(saved, chart, content, relationLabel);
  return tokens.every((token) => {
    const gateLine = /^(\d{1,2})\.([1-6])$/.exec(token);
    if (gateLine) {
      if (!chart) return false;
      const gate = Number(gateLine[1]);
      const line = Number(gateLine[2]);
      return [chart.personality, chart.design].some((set) =>
        BODIES.some((b) => set[b].gate === gate && set[b].line === line),
      );
    }
    if (/^\d{1,2}$/.test(token) && Number(token) >= 1 && Number(token) <= 64) {
      return !!chart?.gates.some((g) => g.gate === Number(token));
    }
    const channel = /^(\d{1,2})-(\d{1,2})$/.exec(token);
    if (channel) {
      const [a, b] = [Number(channel[1]), Number(channel[2])].sort((x, y) => x - y);
      return !!chart?.channels.includes(`${a}-${b}` as Chart['channels'][number]);
    }
    return text.includes(token);
  });
}
