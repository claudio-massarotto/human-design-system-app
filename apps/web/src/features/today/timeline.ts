// Timeline del transito (calcolo; la vista è in TransitTimeline.tsx): come cambia il cielo nelle ore dopo un istante dato.
// Funzione pura: riceve il calcolo del transito (reale o finto) e non conosce il motore.
import {
  BODIES,
  CHANNEL_BY_ID,
  type Body,
  type CenterId,
  type ChannelId,
  type Gate,
  type Transit,
} from '@hd/core';
import type { TransitFn } from './sunCalendar';

/** Canali e centri accesi da un transito (dal solo cielo o sommati al tuo chart). */
export interface TransitState {
  channels: readonly ChannelId[];
  centers: readonly CenterId[];
}

export type AnalyzeFn = (transit: Transit) => TransitState;

/** Intervallo [start, end) già ritagliato sulla finestra della timeline. */
export interface Span {
  start: Date;
  end: Date;
}

export interface GateSpan extends Span {
  gate: Gate;
}

export type TimelineEvent =
  | { kind: 'ingress'; at: Date; body: Body; gate: Gate; fromGate: Gate }
  | { kind: 'channelOn' | 'channelOff'; at: Date; id: ChannelId }
  | { kind: 'centerOn' | 'centerOff'; at: Date; id: CenterId };

export interface TransitTimeline {
  from: Date;
  to: Date;
  bodies: { body: Body; spans: GateSpan[] }[];
  /** Solo i canali accesi per almeno un tratto della finestra. */
  channels: { id: ChannelId; spans: Span[] }[];
  centers: { id: CenterId; spans: Span[] }[];
  /** In ordine di tempo; quello che è già attivo all'inizio non è un evento. */
  events: TimelineEvent[];
}

export interface TimelineOptions {
  /** Ampiezza della finestra (predefinito: 24 ore). */
  hours?: number;
  /** Passo di campionamento (predefinito: 15 minuti; la Luna resta in una porta ~10 ore). */
  stepMs?: number;
  /** Precisione degli istanti di cambio (predefinito: 1 minuto). */
  precisionMs?: number;
}

const HOUR_MS = 3_600_000;

/** Canali e centri del solo cielo: un centro è definito se un canale del transito lo tocca. */
export function skyState(transit: Transit): TransitState {
  const centers = new Set<CenterId>();
  for (const id of transit.channels)
    for (const c of CHANNEL_BY_ID[id]?.centers ?? []) centers.add(c);
  return { channels: transit.channels, centers: [...centers] };
}

/**
 * Campiona la finestra a passo fisso e affina per bisezione ogni cambio di porta di ciascun corpo.
 * Canali e centri cambiano solo quando cambia una porta: basta valutarli a quegli istanti.
 */
export function transitTimeline(
  compute: TransitFn,
  analyze: AnalyzeFn,
  from: Date,
  options: TimelineOptions = {},
): TransitTimeline {
  const start = from.getTime();
  const end = start + (options.hours ?? 24) * HOUR_MS;
  const step = Math.max(60_000, options.stepMs ?? 15 * 60_000);
  const precision = Math.max(1, options.precisionMs ?? 60_000);

  const cache = new Map<number, Transit>();
  const at = (ms: number): Transit => {
    let t = cache.get(ms);
    if (!t) cache.set(ms, (t = compute(new Date(ms))));
    return t;
  };

  // 1. Istanti di cambio porta, corpo per corpo (al più un cambio per passo).
  const changes = new Set<number>();
  for (let lo = start; lo < end; lo += step) {
    const hi = Math.min(lo + step, end);
    for (const body of BODIES) {
      const before = at(lo).activations[body].gate;
      if (at(hi).activations[body].gate === before) continue;
      let a = lo;
      let b = hi;
      while (b - a > precision) {
        const mid = Math.floor((a + b) / 2);
        if (at(mid).activations[body].gate === before) a = mid;
        else b = mid;
      }
      changes.add(b);
    }
  }

  // 2. Stato a ogni tratto in cui nulla cambia.
  const times = [start, ...[...changes].sort((x, y) => x - y)];
  const states = times.map((ms) => {
    const transit = at(ms);
    const { channels, centers } = analyze(transit);
    return { ms, transit, channels: new Set(channels), centers: new Set(centers) };
  });
  const endOf = (i: number) => states[i + 1]?.ms ?? end;

  // 3. Tratti per riga, uniti quando il valore resta uguale.
  const bodies = BODIES.map((body) => {
    const spans: GateSpan[] = [];
    states.forEach((s, i) => {
      const gate = s.transit.activations[body].gate;
      const last = spans.at(-1);
      if (last && last.gate === gate) last.end = new Date(endOf(i));
      else spans.push({ gate, start: new Date(s.ms), end: new Date(endOf(i)) });
    });
    return { body, spans };
  });

  function presence<K>(pick: (s: (typeof states)[number]) => Set<K>): { id: K; spans: Span[] }[] {
    const rows = new Map<K, Span[]>();
    states.forEach((s, i) => {
      for (const id of pick(s)) {
        const spans = rows.get(id) ?? [];
        const last = spans.at(-1);
        if (last && last.end.getTime() === s.ms) last.end = new Date(endOf(i));
        else spans.push({ start: new Date(s.ms), end: new Date(endOf(i)) });
        rows.set(id, spans);
      }
    });
    return [...rows].map(([id, spans]) => ({ id, spans }));
  }

  // 4. Eventi: differenze tra uno stato e il precedente.
  const events: TimelineEvent[] = [];
  for (let i = 1; i < states.length; i++) {
    const prev = states[i - 1]!;
    const cur = states[i]!;
    const when = new Date(cur.ms);
    for (const body of BODIES) {
      const a = prev.transit.activations[body].gate;
      const b = cur.transit.activations[body].gate;
      if (a !== b) events.push({ kind: 'ingress', at: when, body, gate: b, fromGate: a });
    }
    for (const id of cur.channels)
      if (!prev.channels.has(id)) events.push({ kind: 'channelOn', at: when, id });
    for (const id of prev.channels)
      if (!cur.channels.has(id)) events.push({ kind: 'channelOff', at: when, id });
    for (const id of cur.centers)
      if (!prev.centers.has(id)) events.push({ kind: 'centerOn', at: when, id });
    for (const id of prev.centers)
      if (!cur.centers.has(id)) events.push({ kind: 'centerOff', at: when, id });
  }

  return {
    from: new Date(start),
    to: new Date(end),
    bodies,
    channels: presence((s) => s.channels),
    centers: presence((s) => s.centers),
    events,
  };
}
