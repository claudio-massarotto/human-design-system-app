import { DateTime } from 'luxon';
import {
  CENTERS,
  GATE_CENTER,
  type Activation,
  type ActivationSet,
  type Authority,
  type Body,
  type CenterId,
  type ChannelId,
  type Chart,
  type Definition,
  type Gate,
  type HDType,
  type Line,
  type ProfileId,
  type Side,
  type SensitivityField,
} from '@hd/core';

/** Che cosa mostra il pannello di dettaglio. */
export type DetailTarget =
  | { kind: 'gate'; gate: Gate }
  | { kind: 'channel'; id: ChannelId }
  | { kind: 'center'; id: CenterId }
  | { kind: 'type'; id: HDType }
  | { kind: 'authority'; id: Authority }
  | { kind: 'profile'; id: ProfileId }
  | { kind: 'definition'; id: Definition }
  | { kind: 'cross'; slug: string; number?: number }
  | { kind: 'activation'; side: Exclude<Side, 'transit'>; body: Body };

export type NatalSide = Exclude<Side, 'transit'>;

export const ZODIAC = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
] as const;
export type ZodiacSign = (typeof ZODIAC)[number];

/** Longitudine eclittica → segno, gradi e primi di grado. */
export function zodiacOf(longitude: number): {
  sign: ZodiacSign;
  degrees: number;
  minutes: number;
} {
  const lon = ((longitude % 360) + 360) % 360;
  const inSign = lon % 30;
  let degrees = Math.floor(inSign);
  let minutes = Math.floor((inSign - degrees) * 60);
  if (minutes >= 60) {
    minutes = 0;
    degrees += 1;
  }
  return { sign: ZODIAC[Math.floor(lon / 30)] ?? 'aries', degrees, minutes };
}

/** "UTC−05:00" / "UTC+05:30" per un fuso IANA a un dato istante. */
export function utcOffsetLabel(isoUtc: string, timezone: string): string | null {
  const dt = DateTime.fromISO(isoUtc, { zone: timezone });
  if (!dt.isValid) return null;
  const total = dt.offset;
  const sign = total < 0 ? '−' : '+';
  const abs = Math.abs(total);
  const h = String(Math.floor(abs / 60)).padStart(2, '0');
  const m = String(abs % 60).padStart(2, '0');
  return `UTC${sign}${h}:${m}`;
}

/** Data (e ora) locale di un istante ISO nel fuso del luogo di nascita. */
export function formatInZone(
  isoUtc: string,
  timezone: string,
  locale: string,
  withTime = false,
): string {
  try {
    return new Date(isoUtc).toLocaleString(locale, {
      dateStyle: 'medium',
      ...(withTime ? { timeStyle: 'short' as const } : {}),
      timeZone: timezone,
    });
  } catch {
    return isoUtc;
  }
}

/** Ora del giorno "HH:mm" di partenza + scostamento in minuti. */
export function clockAt(
  base: string | null,
  offsetMinutes: number,
): { time: string; dayShift: -1 | 0 | 1 } {
  const [h, m] = (base ?? '12:00').split(':').map(Number) as [number, number];
  const total = h * 60 + m + offsetMinutes;
  const day = Math.floor(total / 1440);
  const mod = ((total % 1440) + 1440) % 1440;
  const hh = String(Math.floor(mod / 60)).padStart(2, '0');
  const mm = String(mod % 60).padStart(2, '0');
  return { time: `${hh}:${mm}`, dayShift: day < 0 ? -1 : day > 0 ? 1 : 0 };
}

export function activationOf(chart: Chart, side: NatalSide, body: Body): Activation {
  return (side === 'design' ? chart.design : chart.personality)[body];
}

export function setOf(chart: Chart, side: NatalSide): ActivationSet {
  return side === 'design' ? chart.design : chart.personality;
}

/** Strati (personalità/design) che attivano una porta nel chart. */
export function gateSides(chart: Chart, gate: Gate): NatalSide[] {
  const g = chart.gates.find((x) => x.gate === gate);
  const out: NatalSide[] = [];
  if (g?.personality.length) out.push('personality');
  if (g?.design.length) out.push('design');
  return out;
}

/** Linee attivate in una porta, raggruppate per linea, con i corpi che le portano. */
export function gateLines(
  chart: Chart,
  gate: Gate,
): { line: Line; items: { side: NatalSide; body: Body }[] }[] {
  const g = chart.gates.find((x) => x.gate === gate);
  if (!g) return [];
  const map = new Map<Line, { side: NatalSide; body: Body }[]>();
  const add = (side: NatalSide, bodies: Body[]) => {
    for (const body of bodies) {
      const line = activationOf(chart, side, body).line;
      const list = map.get(line) ?? [];
      list.push({ side, body });
      map.set(line, list);
    }
  };
  add('personality', g.personality);
  add('design', g.design);
  return [...map.entries()].sort((a, b) => a[0] - b[0]).map(([line, items]) => ({ line, items }));
}

/** Porte attive di un centro. */
export function activeGatesOfCenter(chart: Chart, center: CenterId): Gate[] {
  return chart.gates.map((g) => g.gate).filter((g) => GATE_CENTER[g] === center);
}

export function definedCount(chart: Chart): number {
  return CENTERS.filter((c) => chart.centers[c] === 'defined').length;
}

export const SENSITIVITY_FIELDS: readonly SensitivityField[] = [
  'type',
  'authority',
  'profile',
  'definition',
  'cross',
  'channels',
];

/** Nome file sicuro per il download (rimuove solo i caratteri non ammessi). */
export function safeFileName(name: string): string {
  const cleaned = name
    .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || 'chart';
}
