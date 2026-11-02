// Piccole funzioni pure che compongono la lettura di "Oggi" dai dati del motore.
import { CHANNEL_BY_ID, type ChannelId, type Gate } from '@hd/core';

export interface ChannelGateSource {
  gate: Gate;
  /** Chi porta la porta: il tuo chart oppure il transito. */
  from: 'natal' | 'transit';
}

/** Per un canale nuovo: quali porte arrivano dal tuo chart e quali dal transito. */
export function channelGateSources(
  id: ChannelId,
  natalGates: ReadonlySet<Gate>,
  transitGates: ReadonlySet<Gate>,
): ChannelGateSource[] {
  const def = CHANNEL_BY_ID[id];
  if (!def) return [];
  return def.gates.map((gate) => ({
    gate,
    from: natalGates.has(gate) ? 'natal' : transitGates.has(gate) ? 'transit' : 'natal',
  }));
}

const MINUTE = 60_000;

/** Formato `YYYY-MM-DDTHH:mm` (ora locale) per <input type="datetime-local">. */
export function toInputValue(date: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}T${p(date.getHours())}:${p(date.getMinutes())}`;
}

/** Inverso di `toInputValue`; null se il valore non è valido. */
export function fromInputValue(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Istante corrente arrotondato al minuto. */
export function nowRounded(now: Date = new Date()): Date {
  return new Date(Math.floor(now.getTime() / MINUTE) * MINUTE);
}

/** Sposta di `days` giorni di calendario locale (rispetta il cambio dell'ora legale). */
export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
