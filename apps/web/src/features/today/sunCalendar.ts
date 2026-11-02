// Calendario del Sole: prossime date di ingresso del Sole in una nuova porta.
// Funzione pura: riceve il calcolo del transito (reale o finto) e non conosce il motore.
import type { Gate, Transit } from '@hd/core';

export type TransitFn = (at: Date) => Transit;

export interface SunIngress {
  /** Istante (precisione: `precisionMs`) in cui il Sole entra nella nuova porta. */
  at: Date;
  /** Porta in cui entra (linea 1). */
  gate: Gate;
  /** Porta che lascia. */
  fromGate: Gate;
}

export interface SunCalendarOptions {
  /** Precisione dell'ingresso in millisecondi (predefinito: 1 minuto). */
  precisionMs?: number;
  /** Limite di ricerca in giorni, a protezione da dati anomali (predefinito: 400). */
  maxDays?: number;
}

const DAY_MS = 86_400_000;

/**
 * Cerca le prossime `count` date in cui il Sole cambia porta, a partire da `from`.
 * Passi giornalieri (il Sole percorre ~1°/giorno, una porta ne misura 5,625: nessuna porta
 * può essere saltata) e poi bisezione fino alla precisione richiesta.
 */
export function nextSunIngresses(
  compute: TransitFn,
  from: Date,
  count = 4,
  options: SunCalendarOptions = {},
): SunIngress[] {
  const precisionMs = Math.max(1, options.precisionMs ?? 60_000);
  const maxDays = options.maxDays ?? 400;
  const gateAt = (ms: number): Gate => compute(new Date(ms)).activations.sun.gate;

  const out: SunIngress[] = [];
  let lo = from.getTime();
  let loGate = gateAt(lo);

  for (let day = 0; day < maxDays && out.length < count; day++) {
    const hi = lo + DAY_MS;
    const hiGate = gateAt(hi);
    if (hiGate === loGate) {
      lo = hi;
      continue;
    }
    // Il cambio è in (lo, hi]: bisezione sull'ultimo istante con la vecchia porta.
    let a = lo;
    let b = hi;
    while (b - a > precisionMs) {
      const mid = Math.floor((a + b) / 2);
      if (gateAt(mid) === loGate) a = mid;
      else b = mid;
    }
    const gate = gateAt(b);
    out.push({ at: new Date(b), gate, fromGate: loGate });
    lo = b;
    loGate = gate;
  }
  return out;
}
