import type { Locale } from '@hd/content';

/** "gio 5 nov, 14:20" nel fuso del dispositivo. */
export function formatMoment(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/** "mercoledì 4 novembre 2026". */
export function formatDay(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(date);
}

/** "tra 3 giorni" / "tra 5 ore" rispetto a `from`. */
export function formatRelative(from: Date, to: Date, locale: Locale): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const hours = (to.getTime() - from.getTime()) / 3_600_000;
  if (Math.abs(hours) < 36) return rtf.format(Math.round(hours), 'hour');
  return rtf.format(Math.round(hours / 24), 'day');
}
