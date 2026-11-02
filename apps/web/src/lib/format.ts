import type { BirthInput } from '@hd/core';
import type { Locale } from '@hd/content';

/** 'YYYY-MM-DD' → data leggibile nella lingua scelta (senza slittamenti di fuso). */
export function formatBirthDate(date: string, locale: Locale): string {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(locale, {
    dateStyle: 'long',
    timeZone: 'UTC',
  });
}

/** Ora di nascita per l'elenco: "14:30", "≈ 14:30" oppure null se sconosciuta. */
export function formatBirthTime(birth: BirthInput): string | null {
  if (birth.timeAccuracy === 'unknown' || !birth.time) return null;
  return birth.timeAccuracy === 'approximate' ? `≈ ${birth.time}` : birth.time;
}
