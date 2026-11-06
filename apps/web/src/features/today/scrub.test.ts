import { describe, expect, it } from 'vitest';
import { playbackDelayMs, shiftBy } from './scrub';

describe('shiftBy', () => {
  const base = new Date(2026, 0, 31, 10, 30);
  it('ora e giorno', () => {
    expect(shiftBy(base, 'hour', 3).getTime() - base.getTime()).toBe(3 * 3_600_000);
    expect(shiftBy(base, 'day', 1)).toEqual(new Date(2026, 1, 1, 10, 30));
    expect(shiftBy(base, 'day', -31)).toEqual(new Date(2025, 11, 31, 10, 30));
  });
  it('settimana', () => {
    expect(shiftBy(base, 'week', 2)).toEqual(new Date(2026, 1, 14, 10, 30));
  });
  it('mese: non sborda sul mese dopo e torna indietro', () => {
    expect(shiftBy(base, 'month', 1)).toEqual(new Date(2026, 1, 28, 10, 30));
    expect(shiftBy(base, 'month', 2)).toEqual(new Date(2026, 2, 31, 10, 30));
    expect(shiftBy(base, 'month', -2)).toEqual(new Date(2025, 10, 30, 10, 30));
    expect(shiftBy(base, 'month', 0)).toEqual(base);
  });
  it('non modifica la data di partenza', () => {
    const copy = new Date(base);
    shiftBy(base, 'month', 5);
    expect(base).toEqual(copy);
  });
  it('ritardo di riproduzione positivo per ogni passo', () => {
    for (const s of ['hour', 'day', 'week', 'month'] as const)
      expect(playbackDelayMs(s)).toBeGreaterThan(0);
  });
});
