// Passi di scorrimento nel tempo per la ruota interattiva di "Oggi" (logica pura, senza UI).

export type ScrubStep = 'hour' | 'day' | 'week' | 'month';

export const SCRUB_STEPS: readonly ScrubStep[] = ['hour', 'day', 'week', 'month'];

/** Quanti passi lo slider copre da ciascun lato dell'ancora. */
export const SCRUB_RANGE = 48;

/** Sposta di `n` passi (anche negativi). Giorno, settimana e mese seguono il calendario locale. */
export function shiftBy(date: Date, step: ScrubStep, n: number): Date {
  const d = new Date(date);
  switch (step) {
    case 'hour':
      return new Date(d.getTime() + n * 3_600_000);
    case 'day':
      d.setDate(d.getDate() + n);
      return d;
    case 'week':
      d.setDate(d.getDate() + n * 7);
      return d;
    case 'month': {
      // Un 31 gennaio + 1 mese è fine febbraio, non marzo.
      const day = d.getDate();
      d.setDate(1);
      d.setMonth(d.getMonth() + n);
      const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      d.setDate(Math.min(day, last));
      return d;
    }
  }
}

/** Pausa tra due passi in riproduzione: i passi grandi scorrono più in fretta per restare leggibili. */
export function playbackDelayMs(step: ScrubStep): number {
  return step === 'hour' ? 250 : step === 'day' ? 350 : 500;
}
